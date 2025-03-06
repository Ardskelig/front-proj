import { createRouter, createWebHistory } from 'vue-router'

import LayoutContainer from '@/views/LayoutContainer.vue'
import TestVue from '@/views/Content/test.vue'
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
      path:'/test',
      component:TestVue
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
      component: () => import('@/views/Notice/DetailPage.vue'), // 动态导入
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
          component: () => import('@/views/Notice/Notice.vue'),
          meta: { title: '通知中心' }
        },
        {
          path: 'Wallet',
          component: () => import('@/views/Wallet/Wallet.vue'),
          meta: { title: '我的钱包' }
        },
        {
          path: 'qr-scanner',
          component: () => import('@/views/qrScanner.vue'),
          meta: { title: '扫一扫' }
        },
        // {
        //   path: 'qr-scanner',
        //   component: () => import('@/views/qrScanner.vue'),
        //   meta: { tabIndex: 0 }
        // }
      ]
    }
  ],
})

export default router
