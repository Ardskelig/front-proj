import { createRouter, createWebHistory } from 'vue-router'

import LayoutContainer from '@/views/LayoutContainer.vue'
import LoginPage from '@/views/Login/LoginPage.vue'
import StudentRegister from '@/views/Login/StudentRegister.vue'
import VistorRegister from '@/views/Login/VistorRegister.vue'
import ChooseSV from '@/views/Login/ChooseSV.vue'
import TestVue from '@/views/Content/test.vue'
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
      path:'/',
      component:LayoutContainer,
      name:'home',
      redirect:'/login',
      children:[
        {
          path:'/content/test',
          component:TestVue
        }
      ]
    }
  ],
})

export default router
