// main.js 修改后的完整代码
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Notify } from 'vant';
import { 
  // 基础组件
  Button,
  Cell,
  CellGroup,
  // 导航
  NavBar,
  Tabbar, 
  TabbarItem,
  // 表单
  Form, 
  Field,
  RadioGroup, 
  Radio,
  Uploader,
  // 展示
  Image as VanImage,
  Grid,
  GridItem,
  Loading,
  List,
  Popup,
  Icon,
  NoticeBar,
  Dialog,
  // 功能
  Toast,
  Checkbox,
  CheckboxGroup,
  Switch,
  Card,

  ImagePreview  // 特别注意：这个组件不需要注册，直接使用API
} from 'vant'
import { Cascader } from 'vant';
import 'vant/lib/index.css';
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'
import { Calendar } from 'vant';
import { initDB, initRootDID } from './db.js';
import { Picker } from 'vant';
const startApp = async () => {
  try {
    await initDB()
    await initRootDID()
    
    const app = createApp(App)

    // 正确注册的组件列表（仅需要全局注册的）
    const vantComponents = [
      Button,
      Cell,
      CellGroup,
      NavBar,
      Tabbar,
      TabbarItem,
      Form,
      Field,
      RadioGroup,
      Radio,
      Uploader,
      VanImage,
      Grid,
      GridItem,
      Loading,
      List,
      Popup,
      Icon,
      NoticeBar,
      Dialog,
      Toast,
      Checkbox,
      CheckboxGroup,
      Switch,
      Card

    ]
    
    // 注册全局组件
    vantComponents.forEach(component => {
      app.use(component)
    })

    // 其他插件
    app.use(createPinia())
    app.use(Calendar);
    app.use(Notify);
    app.use(router)
    app.use(ElementPlus)
    app.use(Picker);
    app.use(Cascader);   
    // 挂载ImagePreview到全局属性（可选）
    app.config.globalProperties.$imagePreview = ImagePreview
    
    app.mount('#app')
    
  } catch (err) {
    console.error('Bootstrap failed:', err)
    document.body.innerHTML = `<h1>系统初始化失败，请刷新重试</h1>`
  }
}

startApp()
