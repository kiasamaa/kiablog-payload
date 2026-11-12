import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type NavCategory = {
  id: number
  title: string
  slug: string
  count: number
  series: string[]
}

export type NavData = {
  categories: NavCategory[]
  total: number
}

/** 汇总导航「开始浏览」面板需要的分类 → 系列结构 */
export const getNavData = async (): Promise<NavData> => {
  const payload = await getPayload({ config: configPromise })

  const [categories, posts] = await Promise.all([
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 50,
      overrideAccess: false,
      pagination: false,
      sort: 'sort',
      select: {
        title: true,
        slug: true,
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      select: {
        category: true,
        series: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
  ])

  const categoriesData = categories.docs.map((category) => {
    const ofCategory = posts.docs.filter((post) => {
      const categoryID = typeof post.category === 'object' ? post.category?.id : post.category

      return categoryID === category.id
    })

    const series = Array.from(
      new Set(
        ofCategory.map((post) => post.series).filter((value): value is string => Boolean(value)),
      ),
    )

    return {
      count: ofCategory.length,
      id: category.id,
      series,
      slug: category.slug,
      title: category.title,
    }
  })

  return {
    categories: categoriesData,
    total: posts.docs.length,
  }
}
