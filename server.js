
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'verify-saas-enterprise-key-2024';
const DB_PATH = path.join(__dirname, 'db.json');

// --- DATABASE INITIALIZATION ---
const initDb = () => {
    let currentDb = {
        users: [],
        apiKeys: [],
        jobs: []
    };

    if (fs.existsSync(DB_PATH)) {
        try {
            currentDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        } catch (e) {
            console.error("DB Corrupted, recreating...");
        }
    }
    
    // ENSURE MASTER ADMIN ALWAYS EXISTS
    const masterEmail = 'digitalservicegot@gmail.com';
    const masterPass = 'Shahina123';
    
    const hasMaster = currentDb.users.find(u => u.userId.toLowerCase() === masterEmail.toLowerCase());
    
    if (!hasMaster) {
        currentDb.users.unshift({
            id: 'admin_master',
            userId: masterEmail,
            passwordHash: bcrypt.hashSync(masterPass, 10),
            role: 'admin',
            creditLimit: 999999999,
            usedCredits: 0,
            status: 'active',
            createdAt: new Date().toISOString()
        });
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(currentDb, null, 2));
    return currentDb;
};

let db = initDb();

const saveDb = () => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

// --- AUTH MIDDLEWARES ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.session_token;

    if (!token) return res.status(401).json({ error: 'Authentication required.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Session expired.' });
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Administrative access required.' });
    }
    next();
};

// --- ROUTES ---

/**
 * PUBLIC: Login with Master Fallback
 */
app.post('/api/login', async (req, res) => {
    const { userId, password } = req.body;
    
    // MASTER ACCOUNT HARD-CODED FALLBACK
    const isMaster = userId === 'digitalservicegot@gmail.com' && password === 'Shahina123';
    
    let user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
    
    if (isMaster || (user && await bcrypt.compare(password, user.passwordHash))) {
        // If master logged in but somehow wasn't in DB (e.g. file deleted while server running)
        if (isMaster && !user) {
            db = initDb(); // Re-sync
            user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
        }

        if (user.status !== 'active') return res.status(403).json({ error: 'Account ' + user.status });

        const token = jwt.sign({ id: user.id, role: user.role, userId: user.userId }, JWT_SECRET, { expiresIn: '30d' });
        const { passwordHash, ...safeUser } = user;
        
        res.cookie('session_token', token, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 30*24*60*60*1000 });
        res.json({ token, user: safeUser });
    } else {
        res.status(401).json({ error: 'Invalid credentials. Please check your User ID and Password.' });
    }
});

app.get('/api/me', authenticateToken, (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User session invalid.' });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
});

/**
 * PUBLIC: Signup Request
 */
app.post('/api/signup', async (req, res) => {
    const { userId, password } = req.body;
    if (db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase())) {
        return res.status(400).json({ error: 'Identity already registered in the system.' });
    }
    const newUser = {
        id: 'u_' + Date.now(),
        userId,
        passwordHash: await bcrypt.hash(password || '1234', 10),
        role: 'user',
        creditLimit: 0,
        usedCredits: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb();
    res.json({ success: true });
});

/**
 * ADMIN: Users Management
 */
app.get('/admin/users', authenticateToken, isAdmin, (req, res) => {
    res.json(db.users.map(({ passwordHash, ...u }) => u));
});

app.post('/admin/create-user', authenticateToken, isAdmin, async (req, res) => {
    const { userId, password, role, creditLimit, assignedApiId } = req.body;
    if (db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase())) {
        return res.status(400).json({ error: 'User ID already exists.' });
    }
    const newUser = {
        id: 'u_' + Date.now(),
        userId,
        passwordHash: await bcrypt.hash(password || '1234', 10),
        role: role || 'user',
        creditLimit: parseInt(creditLimit) || 0,
        usedCredits: 0,
        assignedApiId,
        status: 'active',
        createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDb();
    res.json(newUser);
});

app.put('/admin/edit-user/:id', authenticateToken, isAdmin, async (req, res) => {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Target user not found.' });
    
    const { password, ...updates } = req.body;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);
    
    Object.assign(user, updates);
    saveDb();
    res.json({ success: true });
});

app.delete('/admin/remove-user/:id', authenticateToken, isAdmin, (req, res) => {
    if (req.params.id === 'admin_master') return res.status(403).json({ error: 'The Master Administrator account cannot be deleted.' });
    db.users = db.users.filter(u => u.id !== req.params.id);
    saveDb();
    res.json({ success: true });
});

/**
 * SYSTEM: API Keys
 */
app.get('/api/keys', authenticateToken, (req, res) => {
    res.json(db.apiKeys);
});

app.post('/api/keys', authenticateToken, isAdmin, (req, res) => {
    const { name, key } = req.body;
    const newKey = {
        id: 'k_' + Date.now(),
        name, key, usedCredits: 0, totalLimit: 3000, status: 'active',
        createdAt: new Date().toISOString(),
        resetDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
    };
    db.apiKeys.push(newKey);
    saveDb();
    res.json(newKey);
});

app.delete('/api/keys/:id', authenticateToken, isAdmin, (req, res) => {
    db.apiKeys = db.apiKeys.filter(k => k.id !== req.params.id);
    saveDb();
    res.json({ success: true });
});

app.post('/api/keys/:id/toggle', authenticateToken, isAdmin, (req, res) => {
    const key = db.apiKeys.find(k => k.id === req.params.id);
    if (key) key.status = key.status === 'active' ? 'disabled' : 'active';
    saveDb();
    res.json({ success: true });
});

/**
 * CORE: Verification Jobs
 */
app.post('/api/jobs', authenticateToken, async (req, res) => {
    const user = db.users.find(u => u.id === req.user.id);
    const { emails } = req.body;

    if (user.role !== 'admin' && user.usedCredits + emails.length > user.creditLimit) {
        return res.status(402).json({ error: 'Credit quota exceeded. Current limit: ' + user.creditLimit });
    }

    const job = {
        id: 'j_' + Date.now(),
        creatorId: user.id,
        totalEmails: emails.length,
        processedCount: 0,
        validCount: 0,
        invalidCount: 0,
        riskyCount: 0,
        remainingCount: emails.length,
        status: 'processing',
        emails: emails,
        results: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.jobs.push(job);
    saveDb();

    processJobInServer(job.id);
    res.json(job);
});

app.get('/api/jobs', authenticateToken, (req, res) => {
    const jobs = req.user.role === 'admin' ? db.jobs : db.jobs.filter(j => j.creatorId === req.user.id);
    res.json(jobs.slice(-50).reverse());
});

app.get('/api/jobs/:id', authenticateToken, (req, res) => {
    const job = db.jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: 'Job reference not found.' });
    res.json(job);
});

app.post('/api/jobs/:id/cancel', authenticateToken, (req, res) => {
    const job = db.jobs.find(j => j.id === req.params.id);
    if (job) job.status = 'paused';
    saveDb();
    res.json({ success: true });
});

app.delete('/api/jobs/:id', authenticateToken, (req, res) => {
    db.jobs = db.jobs.filter(j => j.id !== req.params.id);
    saveDb();
    res.json({ success: true });
});

// --- HELPER: Server-side Background Processor ---
async function processJobInServer(jobId) {
    const job = db.jobs.find(j => j.id === jobId);
    if (!job) return;

    const user = db.users.find(u => u.id === job.creatorId);
    const batchSize = 25;
    
    while (job.emails.length > 0 && job.status === 'processing') {
        const batch = job.emails.splice(0, batchSize);
        
        let apiKey = user.assignedApiId 
            ? db.apiKeys.find(k => k.id === user.assignedApiId && k.status === 'active')
            : db.apiKeys.find(k => k.status === 'active' && k.usedCredits < k.totalLimit);

        if (!apiKey) {
            job.status = 'failed';
            job.error = "No active infrastructure nodes available. Rotation pool exhausted.";
            break;
        }

        try {
            const response = await axios.post(
                `https://api.apify.com/v2/acts/account56~email-verifier/run-sync-get-dataset-items?token=${apiKey.key}`,
                { emails: batch }, { timeout: 60000 }
            );

            const results = response.data.map((item, idx) => ({
                id: jobId + '_' + job.processedCount + '_' + idx,
                email: item.email,
                status: item.result === 'OK' ? 'valid' : (item.result === 'INVALID' ? 'invalid' : 'risky'),
                quality: item.quality,
                result: item.result,
                resultCode: item.resultcode,
                subResult: item.subresult,
                free: !!item.free,
                role: !!item.role,
                checkedAt: new Date().toISOString()
            }));

            job.results.push(...results);
            job.processedCount += batch.length;
            job.remainingCount -= batch.length;
            job.validCount += results.filter(r => r.status === 'valid').length;
            job.invalidCount += results.filter(r => r.status === 'invalid').length;
            job.riskyCount += results.filter(r => r.status === 'risky').length;
            
            apiKey.usedCredits += batch.length;
            user.usedCredits += batch.length;
            if (apiKey.usedCredits >= apiKey.totalLimit) apiKey.status = 'exhausted';

            job.updatedAt = new Date().toISOString();
            saveDb();
            
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            job.status = 'failed';
            job.error = "Bridge node timeout. Connection failed.";
            break;
        }
    }

    if (job.status === 'processing') job.status = 'completed';
    saveDb();
}

// --- VITE MIDDLEWARE ---
async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        app.use(express.static('dist'));
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        });
    }

    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`VerifySaaS persistent backend active on http://0.0.0.0:${PORT}`);
        console.log(`Master Admin: digitalservicegot@gmail.com is Ready.`);
    });
}

startServer();
