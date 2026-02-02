# 🔐 Guia de Segurança

## 1. Autenticação e Autorização

### JWT (JSON Web Tokens)

**Estrutura do Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6InVzdWFyaW9AZXhhbXBsZS5jb20iLCJyb2xlIjoiREVWRUxPUEVSIiwiaWF0IjoxNjQzNzkyNDAwLCJleHAiOjE2NDM3OTYwMDB9.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ
```

**Header Payload:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Claims (Dados):**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@example.com",
  "role": "DEVELOPER",
  "permissions": ["read:tasks", "write:tasks", "read:projects"],
  "iat": 1643792400,
  "exp": 1643796000
}
```

### Geração de Tokens

```typescript
import jwt from 'jsonwebtoken';

interface JWTPayload {
  sub: string;           // User ID
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: getPermissionsForRole(user.role),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutos
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'sistema-gestao',
    audience: 'api'
  });
}

function generateRefreshToken(user: User): string {
  const payload = {
    sub: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 dias
  };
  
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256'
  });
}

function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    throw new Error('Token inválido');
  }
}
```

### Middleware de Autenticação

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }
  
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}
```

### Roles-Based Access Control (RBAC)

```typescript
enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  LEAD = 'LEAD',
  DEVELOPER = 'DEVELOPER',
  CLIENT = 'CLIENT'
}

const rolePermissions: Record<Role, string[]> = {
  ADMIN: [
    'read:all', 'write:all', 'delete:all',
    'manage:users', 'manage:roles', 'manage:system'
  ],
  
  MANAGER: [
    'read:projects', 'write:projects',
    'read:tasks', 'write:tasks',
    'manage:team', 'generate:reports'
  ],
  
  LEAD: [
    'read:projects', 'read:tasks', 'write:tasks',
    'manage:tasks', 'create:tasks'
  ],
  
  DEVELOPER: [
    'read:assigned_tasks', 'write:assigned_tasks',
    'read:projects'
  ],
  
  CLIENT: [
    'read:projects', 'read:tasks'
  ]
};

function hasPermission(role: Role, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
```

## 2. Segurança de Dados

### Criptografia

**Senhas (bcrypt):**
```typescript
import bcrypt from 'bcrypt';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Dados Sensíveis (AES-256):**
```typescript
import crypto from 'crypto';

function encryptSensitiveData(data: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptSensitiveData(encryptedData: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Proteção HTTPS

```typescript
// Force HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && 
      process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
```

## 3. Proteção contra Ataques

### SQL Injection

**❌ Inseguro:**
```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);
```

**✅ Seguro (Prepared Statements):**
```typescript
const query = `SELECT * FROM users WHERE email = $1`;
db.query(query, [email]);
```

### XSS (Cross-Site Scripting)

**Sanitização de Input:**
```typescript
import { sanitize } from 'sanitize-html';
import DOMPurify from 'isomorphic-dompurify';

function sanitizeUserInput(input: string): string {
  return sanitize(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: { 'a': ['href', 'title'] }
  });
}

function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
```

### CSRF (Cross-Site Request Forgery)

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

// No formulário
app.get('/form', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Na submissão
app.post('/submit', csrfProtection, (req, res) => {
  res.json({ success: true });
});
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por janela
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas
  skipSuccessfulRequests: true,
  message: 'Muitas tentativas de login. Tente novamente mais tarde.'
});

app.use('/api/', limiter);
app.post('/auth/login', loginLimiter, loginHandler);
```

## 4. Validação e Sanitização

```typescript
import { body, param, query, validationResult } from 'express-validator';

export const validateCreateTask = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Título deve ter entre 5 e 255 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Descrição muito longa'),
  
  body('priority')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Prioridade inválida'),
  
  body('end_date')
    .isISO8601()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data de término deve ser no futuro');
      }
      return true;
    }),
  
  body('assigned_to')
    .isArray()
    .custom((value) => {
      if (value.length === 0) {
        throw new Error('Pelo menos um assignee é necessário');
      }
      return true;
    })
    .custom((value) => {
      return value.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
    })
    .withMessage('UUIDs inválidos'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];
```

## 5. Logging e Auditoria

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';
  createdAt: Date;
}

async function logAuditEvent(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  req?: Request
): Promise<void> {
  const log: AuditLog = {
    id: generateId(),
    userId,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    ipAddress: req?.ip || 'unknown',
    userAgent: req?.get('user-agent') || 'unknown',
    status: 'SUCCESS',
    createdAt: new Date()
  };
  
  await auditLogsRepository.create(log);
  
  // Também registrar em log centralizado
  logger.info('Audit event', log);
}

// Usar no service
async function updateProject(projectId: string, updates: any): Promise<void> {
  const oldProject = await getProject(projectId);
  
  try {
    await projectRepository.update(projectId, updates);
    await logAuditEvent(
      currentUser.id,
      'UPDATE',
      'PROJECT',
      projectId,
      oldProject,
      updates
    );
  } catch (error) {
    await logAuditEvent(
      currentUser.id,
      'UPDATE',
      'PROJECT',
      projectId,
      oldProject,
      updates
    );
    throw error;
  }
}
```

## 6. Proteção de API

### OAuth2 com Google

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await findUserByEmail(profile.emails[0].value);
      
      if (!user) {
        user = await createUser({
          email: profile.emails[0].value,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
          avatar_url: profile.photos[0]?.value
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const tokens = generateTokens(req.user);
    res.redirect(`/dashboard?token=${tokens.accessToken}`);
  }
);
```

## 7. Variáveis de Ambiente Sensíveis

**.env.example:**
```
# JWT
JWT_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
REDIS_URL=redis://localhost:6379

# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Encryption
ENCRYPTION_KEY=your-encryption-key-hex

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# AWS S3 (para uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# Node environment
NODE_ENV=production
API_PORT=3000
```

## 8. Checklist de Segurança

- ✅ Usar HTTPS em produção
- ✅ Implementar HSTS
- ✅ Validar e sanitizar todos os inputs
- ✅ Usar prepared statements para queries
- ✅ Implementar rate limiting
- ✅ Adicionar CSRF protection
- ✅ Usar segurança de headers (helmet.js)
- ✅ Criptografar dados sensíveis
- ✅ Implementar logging e auditoria
- ✅ Fazer backup regular de dados
- ✅ Testar vulnerabilidades regularmente
- ✅ Manter dependências atualizadas
- ✅ Usar secrets manager (não em .env)
- ✅ Implementar 2FA para admin
- ✅ Revisar permissões regularmente
