import { mainCategories, subCategories } from '@/constants/categories'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    throw redirect({
      to: '/$mainCategory/$subCategory',
      params: { mainCategory: mainCategories[0].slug, subCategory: subCategories[0].slug },
    })
  },
})
