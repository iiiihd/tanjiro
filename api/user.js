import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { action } = req.query;

  // تسجيل حساب جديد
  if (action === 'signup') {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    // أنشئ ملف للمستخدم
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      plan: 'basic'
    });
    return res.json({ success: true, user: data.user });
  }

  // تسجيل دخول
  if (action === 'login') {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, session: data.session, user: data.user });
  }

  // جلب بيانات المستخدم
  if (action === 'profile') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ error: 'غير مصرح' });
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    return res.json({ user, profile });
  }

  // ترقية لـ Prime (يُستدعى بعد الدفع)
  if (action === 'upgrade') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) return res.status(401).json({ error: 'غير مصرح' });
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    await supabase.from('profiles').update({
      plan: 'prime',
      plan_expires_at: expiresAt.toISOString()
    }).eq('id', user.id);
    return res.json({ success: true, plan: 'prime' });
  }

  return res.status(400).json({ error: 'action غير معروف' });
}
