const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const { chromium } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');

function waitForPort(port) {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      const socket = net.connect(port, '127.0.0.1', () => {
        clearInterval(interval);
        socket.end();
        resolve();
      });
      socket.on('error', () => {
        socket.destroy();
      });
    }, 100);
  });
}

async function seedDatabase(userId) {
  return new Promise((resolve, reject) => {
    const psql = spawn(
      'psql',
      ['-h', '127.0.0.1', '-p', '54322', '-U', 'postgres', '-f', 'supabase/seed.sql'],
      {
        env: { ...process.env, PGPASSWORD: 'postgres', USER_ID: userId },
        stdio: 'inherit'
      }
    );
    psql.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error('psql failed'));
    });
  });
}

async function run() {
  const supabase = spawn('supabase', ['start', '-D'], { stdio: 'inherit' });
  await waitForPort(54321);

  if (fs.existsSync('supabase/.env')) {
    fs.readFileSync('supabase/.env', 'utf8').split(/\n/).forEach(line => {
      const [k, v] = line.split('=');
      if (k) process.env[k] = v;
    });
  }

  const sb = createClient('http://127.0.0.1:54321', process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const email = 'demo@example.com';
  const password = 'password';
  const { data: { user } } = await sb.auth.admin.createUser({ id: '00000000-0000-0000-0000-000000000001', email, password, email_confirm: true });
  await seedDatabase(user.id);

  const server = spawn('npm', ['run', 'dev'], { cwd: 'app', stdio: 'inherit' });
  await waitForPort(8080);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const session = {
    access_token: 'token',
    refresh_token: 'refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: { id: user.id, app_metadata: { provider: 'email' }, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString(), email }
  };
  await page.addInitScript(`localStorage.setItem('sb-127-auth-token', '${JSON.stringify(session)}'); localStorage.setItem('currentWorkspaceId', '1');`);

  await page.goto('http://localhost:8080/dashboard', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'web/static/img/dashboard.png', fullPage: true });
  await page.goto('http://localhost:8080/manager', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'web/static/img/content-manager.png', fullPage: true });
  await page.goto('http://localhost:8080/builder', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'web/static/img/schema-builder.png', fullPage: true });

  await browser.close();
  server.kill('SIGINT');
  supabase.kill('SIGINT');
}

run();
