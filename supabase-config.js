// ============================================
// Supabase配置文件
// 集中管理Supabase配置，便于部署和环境切换
// ============================================

// ========== 环境检测 ==========
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// ========== 配置定义 ==========
const SupabaseConfig = {
    // 开发环境配置（本地测试）
    development: {
        url: 'https://pnakeholshmrtwctzqcb.supabase.co',
        anonKey: 'sb_publishable_tVf76wqdUIvhiNUymxKHEA_FAMmDvf3',
        serviceRoleKey: '', // 仅后端使用，不要在前端暴露
        bucket: 'sjy-dev-assets'
    },
    
    // 生产环境配置（Vercel部署）
    production: {
        url: 'https://pnakeholshmrtwctzqcb.supabase.co',
        anonKey: 'sb_publishable_tVf76wqdUIvhiNUymxKHEA_FAMmDvf3',
        serviceRoleKey: '',
        bucket: 'sjy-prod-assets'
    },
    
    // 测试环境配置（可选）
    staging: {
        url: 'https://pnakeholshmrtwctzqcb.supabase.co',
        anonKey: 'sb_publishable_tVf76wqdUIvhiNUymxKHEA_FAMmDvf3',
        serviceRoleKey: '',
        bucket: 'sjy-staging-assets'
    }
};

// ========== 根据环境选择配置 ==========
const environment = isProduction ? 'production' : 'development';
const config = SupabaseConfig[environment];

// ========== Supabase客户端初始化 ==========
let supabaseClient = null;

/**
 * 初始化Supabase客户端
 * @returns {object} Supabase客户端实例
 */
function initializeSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }
    
    try {
        // 检查全局是否有supabase库
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase客户端库未加载');
            return null;
        }
        
        // 创建客户端实例
        supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            },
            global: {
                headers: {
                    'X-Application-Name': '三江源生态问答平台',
                    'X-Client-Version': '1.0.0'
                }
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });
        
        console.log(`Supabase客户端已初始化 (${environment}环境)`);
        return supabaseClient;
    } catch (error) {
        console.error('初始化Supabase客户端失败:', error);
        return null;
    }
}

/**
 * 获取Supabase客户端
 * @returns {object} Supabase客户端实例
 */
function getSupabaseClient() {
    if (!supabaseClient) {
        return initializeSupabase();
    }
    return supabaseClient;
}

/**
 * 获取当前配置
 * @returns {object} 当前环境配置
 */
function getConfig() {
    return {
        ...config,
        environment: environment,
        isProduction: isProduction
    };
}

/**
 * 获取项目信息
 * @returns {object} 项目信息
 */
function getProjectInfo() {
    const url = config.url;
    const projectId = url.replace('https://', '').replace('.supabase.co', '');
    
    return {
        projectId: projectId,
        projectUrl: config.url,
        environment: environment,
        region: getProjectRegion(projectId),
        features: {
            database: true,
            auth: true,
            storage: true,
            realtime: false // 根据实际需求启用
        }
    };
}

/**
 * 获取项目区域（从projectId推断）
 * @param {string} projectId - 项目ID
 * @returns {string} 区域名称
 */
function getProjectRegion(projectId) {
    // Supabase项目ID通常包含区域信息
    // 例如：abc123def-us-west-1
    const matches = projectId.match(/(us|eu|ap)-(east|west|south|north|central)-\d+/);
    if (matches) {
        return matches[0];
    }
    return 'unknown';
}

/**
 * 验证配置是否有效
 * @returns {object} 验证结果
 */
function validateConfig() {
    const issues = [];
    
    if (!config.url || !config.url.includes('supabase.co')) {
        issues.push('Supabase URL配置无效');
    }
    
    if (!config.anonKey || config.anonKey.length < 20) {
        issues.push('Supabase匿名密钥配置无效');
    }
    
    const isValid = issues.length === 0;
    
    return {
        isValid,
        issues,
        config: {
            url: config.url ? '已配置' : '未配置',
            anonKey: config.anonKey ? `已配置 (${config.anonKey.substring(0, 10)}...)` : '未配置',
            environment
        }
    };
}

/**
 * 设置自定义配置（用于测试或动态配置）
 * @param {object} customConfig - 自定义配置
 */
function setCustomConfig(customConfig) {
    if (!customConfig || typeof customConfig !== 'object') {
        console.warn('自定义配置无效');
        return;
    }
    
    Object.assign(config, customConfig);
    console.log('已更新Supabase配置:', customConfig);
    
    // 重置客户端以应用新配置
    supabaseClient = null;
}

/**
 * 获取数据库表名
 * @returns {object} 表名映射
 */
function getTableNames() {
    return {
        users: 'users',
        userSessions: 'user_sessions',
        qaRecords: 'qa_records',
        collections: 'collections',
        systemLogs: 'system_logs' // 可选：系统日志表
    };
}

/**
 * 获取数据库模式
 * @returns {object} 模式信息
 */
function getSchemaInfo() {
    return {
        schema: 'public',
        version: '1.0.0',
        tables: [
            { name: 'users', description: '用户表', hasRLS: true },
            { name: 'user_sessions', description: '用户会话表', hasRLS: true },
            { name: 'qa_records', description: '问答记录表', hasRLS: true },
            { name: 'collections', description: '收藏记录表', hasRLS: true }
        ],
        views: [
            { name: 'user_behavior_stats', description: '用户行为统计视图' },
            { name: 'admin_stats', description: '管理员统计视图' },
            { name: 'weekly_activity', description: '周活跃统计视图' },
            { name: 'monthly_activity', description: '月活跃统计视图' }
        ],
        functions: [
            { name: 'get_user_stats', description: '获取用户统计函数' },
            { name: 'get_admin_stats', description: '获取管理员统计函数' },
            { name: 'get_recent_sessions', description: '获取最近会话函数' }
        ]
    };
}

/**
 * 获取API端点URL
 * @param {string} endpoint - 端点名称
 * @returns {string} 完整的API URL
 */
function getApiUrl(endpoint = '') {
    const baseUrl = config.url;
    
    const endpoints = {
        rest: `${baseUrl}/rest/v1`,
        auth: `${baseUrl}/auth/v1`,
        storage: `${baseUrl}/storage/v1`,
        realtime: `${baseUrl}/realtime/v1`
    };
    
    if (endpoint && endpoints[endpoint]) {
        return endpoints[endpoint];
    }
    
    return baseUrl;
}

/**
 * 获取WebSocket URL（用于实时功能）
 * @returns {string} WebSocket URL
 */
function getWebSocketUrl() {
    const wsUrl = config.url.replace('https://', 'wss://');
    return `${wsUrl}/realtime/v1`;
}

/**
 * 检查Supabase服务状态
 * @returns {Promise<object>} 服务状态
 */
async function checkServiceStatus() {
    try {
        const response = await fetch(`${config.url}/rest/v1/`, {
            method: 'HEAD',
            headers: {
                'apikey': config.anonKey
            }
        });
        
        const isHealthy = response.ok;
        
        return {
            isHealthy,
            timestamp: new Date().toISOString(),
            responseStatus: response.status,
            responseStatusText: response.statusText,
            services: {
                database: isHealthy,
                auth: true, // 需要单独的检查
                storage: true, // 需要单独的检查
                realtime: false // 需要单独的检查
            }
        };
    } catch (error) {
        return {
            isHealthy: false,
            timestamp: new Date().toISOString(),
            error: error.message,
            services: {
                database: false,
                auth: false,
                storage: false,
                realtime: false
            }
        };
    }
}

/**
 * 生成API请求头
 * @param {object} additionalHeaders - 附加的请求头
 * @returns {object} 请求头对象
 */
function getApiHeaders(additionalHeaders = {}) {
    const baseHeaders = {
        'apikey': config.anonKey,
        'Authorization': `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client': 'sjy-web-app',
        'X-Client-Version': '1.0.0'
    };
    
    return { ...baseHeaders, ...additionalHeaders };
}

// ========== 导出 ==========
// 如果是在浏览器环境中，将配置挂载到window对象
if (typeof window !== 'undefined') {
    window.SupabaseConfig = {
        initialize: initializeSupabase,
        getClient: getSupabaseClient,
        getConfig: getConfig,
        getProjectInfo: getProjectInfo,
        validateConfig: validateConfig,
        setCustomConfig: setCustomConfig,
        getTableNames: getTableNames,
        getSchemaInfo: getSchemaInfo,
        getApiUrl: getApiUrl,
        getWebSocketUrl: getWebSocketUrl,
        checkServiceStatus: checkServiceStatus,
        getApiHeaders: getApiHeaders,
        // 直接暴露配置（只读）
        config: Object.freeze(config),
        environment: environment,
        isProduction: isProduction
    };
}

// 如果使用ES6模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSupabase,
        getSupabaseClient,
        getConfig,
        getProjectInfo,
        validateConfig,
        setCustomConfig,
        getTableNames,
        getSchemaInfo,
        getApiUrl,
        getWebSocketUrl,
        checkServiceStatus,
        getApiHeaders,
        config: Object.freeze(config),
        environment,
        isProduction
    };
}

// 自动初始化（可选）
if (typeof window !== 'undefined' && window.document) {
    // 延迟初始化，避免阻塞页面加载
    window.addEventListener('DOMContentLoaded', () => {
        console.log('初始化Supabase配置...');
        const validation = validateConfig();
        
        if (!validation.isValid) {
            console.warn('Supabase配置验证失败:', validation.issues);
        } else {
            console.log('Supabase配置验证通过');
            // 可选：立即初始化客户端
            // initializeSupabase();
        }
    });
}

console.log(`三江源生态问答平台 - Supabase配置模块已加载 (${environment}环境)`);