/**
 * IndexedDB 数据库操作模块 v3.4（支持多凭证存储）
 * 主要变更：
 * 1. credentialDataStr 改为数组类型存储多个凭证
 * 2. 调整索引策略支持数组查询
 * 3. 更新凭证操作方法实现数组追加
 */

const DB_NAME = 'DID_System';
const DB_VERSION = 20; // 版本升级（必须升级版本才能修改结构）
const FIXED_ROOT_DID = 'did:tdid:w1:0x69b13ec166fecb3ed289c93c5ca744da36b9f7d3';

let dbInstance = null;

// ████████ 数据库初始化 ████████
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

// 修改后的数据库初始化逻辑（关键修改部分）
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log(`Database upgrading to v${DB_VERSION}`);

      // 清理旧结构（重要！）
      if (db.objectStoreNames.contains('rootDID')) {
        db.deleteObjectStore('rootDID');
      }
      if (db.objectStoreNames.contains('subDID')) {
        db.deleteObjectStore('subDID');
      }

      // 创建根DID存储
      const rootStore = db.createObjectStore('rootDID', {
        keyPath: 'did',
        autoIncrement: false
      });
      // 正确索引配置（单个字段+multiEntry）
      rootStore.createIndex('credential_idx', 'credentialDataStr', { 
        unique: false,
        multiEntry: true // 针对数组字段的索引
      });

      // 创建子DID存储
      const subStore = db.createObjectStore('subDID', {
        keyPath: 'did',
        autoIncrement: false
      });
      // 组合索引的正确配置
      subStore.createIndex('rootDid_idx', 'rootDid', { 
        unique: false 
      });
      subStore.createIndex('usage_idx', 'usage', { 
        unique: false 
      });
      
      // 正确做法：分开创建两个索引
      subStore.createIndex('credential_str', 'credentialDataStr', {
        unique: false,
        multiEntry: true
      });
      subStore.createIndex('root_credential', 'rootDid', {
        unique: false
      });
    };


    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      console.log('Database initialized');
      checkRootDID().then(resolve).catch(reject);
    };

    request.onerror = (event) => {
      reject(new Error(`DB init failed: ${event.target.error}`));
    };
  });
};

// ████████ 根DID操作 ████████
const checkRootDID = async () => {
  const exists = await new Promise((resolve) => {
    const tx = dbInstance.transaction('rootDID', 'readonly');
    tx.objectStore('rootDID').count().onsuccess = (e) => resolve(e.target.result > 0);
  });

  if (!exists) return initRootDID();
  return getCurrentRootDID();
};

export const initRootDID = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('rootDID', 'readwrite');
    const store = tx.objectStore('rootDID');

    const rootData = {
      did: FIXED_ROOT_DID,
      credentialDataStr: [], // 初始化为空数组
      credentials: [],
      vcName: [],
      expireTime:[],
      logo:[],
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    const request = store.add(rootData);
    request.onsuccess = () => resolve(rootData);
    request.onerror = (e) => {
      e.target.error.name === 'ConstraintError' 
        ? resolve(getCurrentRootDID())
        : reject(new Error(`Init root failed: ${e.target.error}`));
    };
  });
};

export const updateRootCredential = async (credential, vcName, expireTime, logo) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('rootDID', 'readwrite');
    const store = tx.objectStore('rootDID');

    store.get(FIXED_ROOT_DID).onsuccess = (e) => {
      const data = e.target.result;
      if (!data) return reject(new Error('Root DID not initialized'));

      const updated = {
        ...data,
        // 向数组追加新凭证
        credentialDataStr: [...data.credentialDataStr, credential],
        vcName: [...data.vcName, vcName],
        expireTime: [...data.expireTime, expireTime],
        logo: [...data.logo, logo],
        updatedAt: new Date().toISOString()
      };

      store.put(updated).onsuccess = () => resolve(updated);
    };
  });
};


// xkb
// ✅ 核心创建函数（参数顺序与调用一致）
export const dbCreateSubDID = async (usage, subDid) => {
  try {
    // 1. 创建子DID基础信息
    const subDID = await createSubDID(usage, subDid);
    
    console.log(subDID)

    // 2. 添加凭证数据
    // await addCredential(subDID.did, subDID);
    
    // 3. 返回完整数据
    return {
      ...subDID,
      credentialDataStr: [] // 返回最新凭证数组????
    };
  } catch (error) {
    throw new Error(`子DID创建失败: ${error.message}`);
  }
};

/* 底层子DID创建 */
const createSubDID = async (usage, subDID) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('subDID', 'readwrite');
    const store = tx.objectStore('subDID');

    // ✅ 生成唯一子DID（固定前缀+时间戳+随机数）
    // const subDid = `${FIXED_ROOT_DID}_sub${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

    
    // ✅ 数据结构严格对应
    const subData = {
      did: subDID,
      rootDid: FIXED_ROOT_DID,
      usage: usage, // 直接使用传入的usage参数
      credentialDataStr: [], // 初始空数组（由addCredential填充）
      vcName:[],
      logo:[],
      expireTime:[],
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    const request = store.add(subData);
    
    request.onsuccess = () => resolve(subData);
    request.onerror = (err) => reject(err);
  });
};

/* 凭证添加函数 */
const addCredential = async (did, credentialData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('subDID', 'readwrite');
    const store = tx.objectStore('subDID');
    
    const request = store.get(did);
    
    request.onsuccess = (e) => {
      const data = e.target.result;
      if (!data) return reject(new Error('子DID不存在'));
      
      // ✅ 更新凭证数组
      data.credentialDataStr.push(credentialData);
      data.updatedAt = new Date().toISOString();
      
      const updateRequest = store.put(data);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = (err) => reject(err);
    };
    
    request.onerror = (err) => reject(err);
  });
};


// xkb
export const updateSubCredential = async (did, credential) => {
  const db = await initDB();
  const currentRoot = await getCurrentRootDID();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('subDID', 'readwrite');
    const store = tx.objectStore('subDID');

    store.get(did).onsuccess = (e) => {
      const data = e.target.result;
      if (!data) return reject(new Error('子DID不存在'));
      if (data.rootDid !== currentRoot.did) {
        return reject(new Error(`DID层级无效，预期: ${currentRoot.did}，实际: ${data.rootDid}`));
      }

      const updated = { 
        ...data,
        // 向数组追加新凭证
        credentialDataStr: [...data.credentialDataStr, credential.credentialDataStr],
        vcName: [...data.vcName, credential.vcName],
        expireTime: [...data.expireTime, credential.expireTime],
        logo: [...data.logo, credential.logo],
        updatedAt: new Date().toISOString()
      };

      store.put(updated).onsuccess = () => resolve(updated);
    };
  });
};

// ████████ 查询操作 ████████
export const getCurrentRootDID = async () => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('rootDID', 'readonly');
    tx.objectStore('rootDID').get(FIXED_ROOT_DID).onsuccess = (e) => resolve(e.target.result);
  });
};

// ████████ 维护操作 ████████
export const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => {
      dbInstance = null;
      resolve();
    };
    request.onerror = (e) => reject(new Error(`Clear failed: ${e.target.error}`));
  });
};

// 扩展：前缀匹配查询
export const searchSubDIDsByUsagePrefix = async (prefix) => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction('subDID', 'readonly');
    console.log(tx);
    const store = tx.objectStore('subDID');
    console.log(store);
    
    // 验证索引是否存在（调试用）
    if (!store.indexNames.contains('usage_idx')) {
      reject(new Error('usage_idx索引不存在，请检查数据库版本'));
      return;
    }

    // 创建前缀范围查询（兼容中文）
    const range = IDBKeyRange.bound(
      prefix, 
      prefix + '\uffff',
      false,  // 包含下界
      false   // 不包含上界
    );

    const request = store.index('usage_idx')
                        .getAll(range); // 获取所有匹配记录

    request.onsuccess = (e) => {
      const results = e.target.result || [];
      resolve(results.sort((a, b) => 
        a.createdAt.localeCompare(b.createdAt) // 按创建时间排序
      ));
    };
    
    request.onerror = (err) => reject(new Error(`查询失败: ${err.target.error}`));
  });
};

// xkb
export const getAllDIDWithCredentials = async () => {
  const db = await initDB();
  
  // 并行获取所有root和子DID
  const [rootDIDs, subDIDs] = await Promise.all([
    new Promise(resolve => {
      const tx = db.transaction('rootDID', 'readonly');
      tx.objectStore('rootDID').getAll().onsuccess = e => resolve(e.target.result);
    }),
    new Promise(resolve => {
      const tx = db.transaction('subDID', 'readonly');
      tx.objectStore('subDID').getAll().onsuccess = e => resolve(e.target.result);
    })
  ]);

  // 构建层级结构
  return rootDIDs.map(root => ({
    did: root.did,
    credentials: root.credentialDataStr || [],
    vcName: root.vcName || [],
    expireTime: root.expireTime || [],
    logo: root.logo || [],
    subDIDs: subDIDs
      .filter(sub => sub.rootDid === root.did)
      .map(sub => ({
        did: sub.did,
        usage: sub.usage,
        credentials: sub.credentialDataStr || [],
        vcName: sub.vcName || [],
        expireTime: sub.expireTime || [],
        logo : sub.logo || [],
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt
      }))
  }));
};


export const getRootDID = async () => {
  try {
    const db = await initDB();
    
    const rootDIDs = await new Promise((resolve, reject) => {
      const transaction = db.transaction('rootDID', 'readonly');
      const store = transaction.objectStore('rootDID');
      const request = store.getAll();
      
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });

    return rootDIDs?.map(root => ({ did: root.did })) || [];
    
  } catch (error) {
    console.error('Failed to fetch root DIDs:', error);
    return [];
  }
};