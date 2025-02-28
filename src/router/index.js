import { createRouter, createWebHistory } from 'vue-router'

import LayoutContainer from '@/views/LayoutContainer.vue'
import LoginPage from '@/views/Login/LoginPage.vue'
import StudentRegister from '@/views/Login/StudentRegister.vue'
import VistorRegister from '@/views/Login/VistorRegister.vue'
import ChooseSV from '@/views/Login/ChooseSV.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/login',
      name:'login',
      component:LoginPage
    },
    {
      path:'/VisitorRegister',
      component:VistorRegister
    },
    {
      path:'/StudentRegister',
      component:StudentRegister
    },
    {
      path:'/ChooseRegister',
      component:ChooseSV
    },

    {
      path: '/detail/:queryId/:blogId',
      name: 'BlogDetail',
      component: () => import('@/views/DetailPage.vue'), // 动态导入
      props: true // 自动将路由参数转为 props
    },
    {
      
      
      path:'/',
      component:LayoutContainer,
      name:'home',
      redirect:'/Notice',
      children:[
        {
          path: 'Notice',
          component: () => import('@/views/Notice.vue'),
          meta: { tabIndex: 0 }
        },
        {
          path: 'Wallet',
          component: () => import('@/views/Wallet.vue'),
          meta: { tabIndex: 0 }
        }
      ]
    }
  ],
})

export default router
