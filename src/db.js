/**
 * IndexedDB 数据库操作模块 v3.3（稳定版）
 * 修改重点：
 * 1. 统一对象存储名称
 * 2. 修复事务操作语法
 * 3. 增强数据一致性校验
 */

const DB_NAME = 'DID_System';
const DB_VERSION = 6; // 版本升级
const FIXED_ROOT_DID = 'did:tdid:w1:0x69b13ec166fecb3ed289c93c5ca744da36b9f7d3';

let dbInstance = null;

// ████████ 数据库初始化 ████████
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      console.log(`Database upgrading to v${DB_VERSION}`);

      // 清除旧版本残留结构
      Array.from(db.objectStoreNames).forEach(name => db.deleteObjectStore(name));

      // 创建根DID存储（单例模式）
      const rootStore = db.createObjectStore('rootDID', {
        keyPath: 'did',
        autoIncrement: false
      });
      rootStore.createIndex('credential_idx', 'credentialDataStr', { unique: true });

      // 创建子DID存储（关联结构）
      const subStore = db.createObjectStore('subDID', {
        keyPath: 'did',
        autoIncrement: false
      });
      subStore.createIndex('rootDid_idx', 'rootDid', { unique: false });
      subStore.createIndex('credential_status', ['rootDid', 'credentialDataStr'], { unique: false });
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      console.log('Database initialized');

      // 自动初始化根DID
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

  if (!exists) {
    return initRootDID();
  }
  return getCurrentRootDID();
};

export const initRootDID = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('rootDID', 'readwrite');
    const store = tx.objectStore('rootDID');

    const rootData = {
      did: FIXED_ROOT_DID,
      credentialDataStr: null,
      credentials: [],
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    const request = store.add(rootData);

    request.onsuccess = () => {
      console.log('Root DID initialized');
      resolve(rootData);
    };
    request.onerror = (e) => {
      e.target.error.name === 'ConstraintError' 
        ? resolve(getCurrentRootDID())
        : reject(new Error(`Init root failed: ${e.target.error}`));
    };
  });
};

export const updateRootCredential = async (credential) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('rootDID', 'readwrite');
    const store = tx.objectStore('rootDID');

    store.get(FIXED_ROOT_DID).onsuccess = (e) => {
      const data = e.target.result;
      if (!data) {
        reject(new Error('Root DID not initialized'));
        return;
      }

      const updated = {
        ...data,
        credentialDataStr: credential,
        updatedAt: new Date().toISOString()
      };

      const request = store.put(updated);
      request.onsuccess = () => resolve(updated);
      request.onerror = (err) => reject(new Error(`Update failed: ${err.target.error}`));
    };
  });
};

// ████████ 子DID操作 ████████
export const createSubDID = async (usage) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('subDID', 'readwrite');
    const store = tx.objectStore('subDID');

    const subDid = `${FIXED_ROOT_DID}_sub${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const subData = {
      did: subDid,
      rootDid: FIXED_ROOT_DID,
      usage,
      credentialDataStr: null,
      createdAt: new Date().toISOString(),
      updatedAt: null
    };

    const request = store.add(subData);
    request.onsuccess = () => resolve(subData);
    request.onerror = (e) => reject(new Error(`Create sub failed: ${e.target.error}`));
  });
};

// db.js 中的 updateSubCredential
export const updateSubCredential = async (did, credential) => {
  console.log('[updateSubCredential] 入参:', { did, credential })
  
  try {
    const db = await initDB()
    const currentRoot = await getCurrentRootDID() // 动态获取当前根DID

    return new Promise((resolve, reject) => {
      const tx = db.transaction('subDID', 'readwrite')
      const store = tx.objectStore('subDID')

      const getRequest = store.get(did)
      
      getRequest.onsuccess = (e) => {
        const data = e.target.result
        console.log('[updateSubCredential] 查询结果:', data)
        
        if (!data) {
          reject(new Error('子DID不存在'))
          return
        }

        // 动态校验根DID
        if (data.rootDid !== currentRoot.did) {
          reject(new Error(`DID层级无效，预期: ${currentRoot.did}，实际: ${data.rootDid}`))
          return
        }

        const updated = { 
          ...data,
          credentialDataStr: credential.credentialDataStr,
          updatedAt: new Date().toISOString()
        }
        console.log('[updateSubCredential] 更新内容:', updated)

        const putRequest = store.put(updated)
        
        putRequest.onsuccess = () => {
          console.log('[updateSubCredential] 更新成功')
          resolve(updated)
        }
        
        putRequest.onerror = (err) => {
          console.error('[updateSubCredential] 写入错误:', err.target.error)
          reject(new Error(`数据库写入失败: ${err.target.error}`))
        }
      }

      getRequest.onerror = (err) => {
        console.error('[updateSubCredential] 查询错误:', err.target.error)
        reject(new Error(`查询子DID失败: ${err.target.error}`))
      }
    })
  } catch (err) {
    console.error('[updateSubCredential] 全局错误:', err)
    throw err
  }
}


// ████████ 查询操作 ████████
export const getCurrentRootDID = async () => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('rootDID', 'readonly');
    tx.objectStore('rootDID').get(FIXED_ROOT_DID).onsuccess = (e) => resolve(e.target.result);
  });
};

export const getSubDIDsByRoot = async () => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction('subDID', 'readonly');
    const store = tx.objectStore('subDID');
    store.index('rootDid_idx').getAll(FIXED_ROOT_DID).onsuccess = (e) => resolve(e.target.result);
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
