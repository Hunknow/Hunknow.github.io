// 简化版 - 移除复杂逻辑，仅保留核心配置
// 保存为 public/supabase-config.js

// 生产环境检测
const isProduction = window.location.hostname === '20061103.xyz';

// Supabase配置
const SUPABASE_CONFIG = {
    url: 'https://pnakeholshmrtwctzqcb.supabase.co',
    anonKey: 'sb_publishable_tVf76wqdUIvhiNUymxKHEA_FAMmDvf3'
};

// 初始化客户端
let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient && window.supabase) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('Supabase客户端已初始化');
    }
    return supabaseClient;
}

// 挂载到全局
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.getSupabaseClient = getSupabaseClient;
}
