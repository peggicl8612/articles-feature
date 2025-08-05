<template>
  <div class="container">
    <div ref="titleRef" class="title text-center mb-4">Articles</div>
    <v-btn color="primary" class="mb-4" @click="openDialog('add')"> 新增文章 </v-btn>
    <!-- 文章列表 -->
    <div class="mb-2">LIST</div>
    <div v-if="articles.length === 0" class="text-grey">目前尚無文章</div>

    <v-card v-for="article in paginatedArticles" :key="article._id" class="card mb-3">
      <v-card-title class="d-flex justify-center align-center">
        <span ref="articleTitles" class="font-weight-medium">{{ article.title }}</span>
      </v-card-title>
      <div class="d-flex justify-end mb-3">
        <v-btn
          v-if="article.author === user.id"
          size="small"
          variant="text"
          @click="openDialog('edit', article)"
          >編輯</v-btn
        >
        <v-btn
          v-if="article.author === user.id"
          size="small"
          variant="text"
          @click="deleteArticle(article._id)"
          >刪除</v-btn
        >
      </div>
      <v-card-text>
        <div class="date">
          <div>發布日期：{{ new Date(article.createdAt).toLocaleString() }}</div>
          <div>更新日期：{{ new Date(article.updatedAt).toLocaleString() }}</div>
        </div>
      </v-card-text>
      <v-card-text>
        <div class="author-test">
          <div>作者：{{ article.author }}</div>
          <br />
          <div>目前登入者 ID：{{ user.id }}</div>
        </div>
      </v-card-text>

      <div class="image-container">
        <v-img
          v-if="article.image"
          :src="article.image"
          class="article-image mb-2"
          height="300px"
          contain
        ></v-img>
      </div>
      <v-card-text class="article-content" :class="{ clamped: !expandedArticles[article._id] }"
        >{{ article.content }}
      </v-card-text>
      <div class="read-more-wrapper">
        <v-btn
          v-if="article.content.length > 50"
          size="small"
          variant="text"
          @click="toggleExpanded(article._id)"
          >{{ expandedArticles[article._id] ? '顯示更少' : '繼續閱讀' }}</v-btn
        >
      </div>

      <v-card-actions class="d-flex justify-end">
        <ToggleLikeArticle
          :article-id="article._id"
          :initial-liked="article.liked"
          :initial-like-count="article.likes"
          @update="
            (liked, likes) => {
              article.liked = liked
              article.likes = likes
            }
          "
        >
          <template #default="{ liked, likes }">
            <v-btn icon>
              <v-icon :color="liked ? 'red' : 'grey'">
                {{ liked ? 'mdi-heart' : 'mdi-heart-outline' }}
              </v-icon>
              <span class="ml-1">{{ likes }}</span>
            </v-btn>
          </template>
        </ToggleLikeArticle>
        <v-btn icon @click="openCommitDialog('comment', article._id)">
          <v-icon>mdi-comment-outline</v-icon>
          <span>留言</span>
        </v-btn>
        <!-- <span class="mr-4">{{ comments.length || 0 }}</span> -->
      </v-card-actions>
    </v-card>
    <CommentArticle v-model:visible="commentDialogVisible" :article-id="selectedArticleId" />

    <!-- 新增/編輯文章組件 -->
    <AddOrEditArticle
      :show="showDialog"
      :mode="dialogMode"
      :article="currentArticle"
      @close="closeDialog"
      @refresh="getArticles"
    />
  </div>
  <div>
    <v-pagination v-model="currentPage" :length="totalPage" rounded></v-pagination>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useI18n } from 'vue-i18n'
import { useAxios } from '@/composables/axios'
import AddOrEditArticle from './components/addOrEditArticle.vue'
import ToggleLikeArticle from './components/toggleLikeArticle.vue'
import CommentArticle from './components/commentArticle.vue'
import { useUserStore } from '@/stores/user'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/all'

const user = useUserStore()
// console.log('目前登入者 ID:', user.id)

const { t } = useI18n()
const { apiAuth } = useAxios()
const createSnackbar = useSnackbar()

const articles = ref([])

const showDialog = ref(false)
const dialogMode = ref('add')
const currentArticle = ref({})
const currentEditId = ref('')

const commentDialogVisible = ref(false)
const selectedArticleId = ref(null)
// 繼續閱讀
const expandedArticles = ref({})
// gsap
const titleRef = ref(null)
// 因為 article title 是由多個 DOM 組成,所以要寫複數
const articleTitles = ref(null)

// pagination
const ITEMS_PER_PAGE = 2
const currentPage = ref(1)
const totalPage = computed(() => Math.ceil(articles.value.length / ITEMS_PER_PAGE))
const paginatedArticles = computed(() => {
  // 第一頁 ( 1 - 1 ) * 2 = 0  // 顯示第 0 ~ 1 篇
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  // 結束的位置是 start + 要顯示的筆數 // end = 0 + 2
  const end = start + ITEMS_PER_PAGE
  // .slice(開始索引, 結束索引)
  // 不包含結束索引
  return articles.value.slice(start, end)
})

function openCommitDialog(type, articleId) {
  if (type === 'comment') {
    selectedArticleId.value = articleId
    commentDialogVisible.value = true
  }
}

const getArticles = async () => {
  try {
    const { data } = await apiAuth.get('/article')
    console.log(
      '後端拿到的文章列表',
      data.result.map((article) => article._id),
    )
    articles.value.splice(0)
    articles.value.push(...data.result)
  } catch (error) {
    console.log(error)
    createSnackbar({
      text: t('api.' + (error?.response?.data?.message || 'unknownError')),
      snackbarProps: {
        color: 'red',
      },
    })
  }
}

// 新增 & 編輯彈窗
const openDialog = (mode, article = null) => {
  dialogMode.value = mode
  showDialog.value = true
  currentEditId.value = article._id

  if (mode === 'edit' && article) {
    currentArticle.value = { ...article }
  } else {
    currentArticle.value = {}
  }
}

const closeDialog = () => {
  showDialog.value = false
  currentArticle.value = {}
}

// 刪除文章
const deleteArticle = async (articleId) => {
  console.log('要刪除的 id:', articleId)
  console.log(
    '目前列表：',
    articles.value.map((article) => article._id),
  )
  try {
    await apiAuth.delete(`/article/${articleId}`)
    articles.value = articles.value.filter((item) => item._id !== articleId)

    createSnackbar({
      text: '刪除成功',
      snackbarProps: {
        color: 'success',
      },
    })
  } catch (error) {
    console.log('刪除文章失敗', error)
    createSnackbar({
      text: '已刪除文章',
      snackbarProps: {
        color: 'gray',
      },
    })
  }
}

// 繼續閱讀/顯示更好 切換功能
function toggleExpanded(articleId) {
  expandedArticles.value[articleId] = !expandedArticles.value[articleId]
}

// 初始化載入文章
getArticles()

onMounted(async () => {
  // 尚未登入不 call profile
  if (!user.token) return

  if (!user.id) {
    try {
      const { data } = await apiAuth.get('/user/profile')
      user.login({ ...data.result, token: user.token })
      console.log('登入者 ID', user.id)
    } catch (error) {
      console.log(error)
    }
  }
})

// gsap
onMounted(async () => {
  // 等文章載入了再啟動動畫
  await getArticles()
  gsap.registerPlugin(ScrollTrigger)

  const el = titleRef.value
  const chars = el.textContent.split('')
  el.innerHTML = chars.map((char) => `<span class="char">${char}</span>`).join('')

  gsap.from('.char', {
    opacity: 0,
    y: 20,
    stagger: 0.05,
    duration: 1,
    ease: 'power2.out',
  })

  // 處理每個 articleTitle
  articleTitles.value.forEach((el) => {
    const chars = el.textContent.split('')
    el.innerHTML = chars.map((char) => `<span class="char2">${char}</span>`).join('')

    gsap.from(el.querySelectorAll('.char2'), {
      opacity: 0,
      y: 50,
      duration: 0.3,
      stagger: 0.03,
      ease: 'power2.in',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play reset play none',
      },
    })
  })
})
</script>

<style scoped>
body {
  font-family: 'Zen Old Mincho', serif;
}
.container {
  margin: 0 auto;
  padding: 4vw;
}
.title {
  font-size: 40px;
  color: rgb(74, 67, 60);
}
.card {
  height: auto;
  padding: 10px;
  background: linear-gradient(180deg, #f5ebf1 30%, #ead4e8 80%);
}
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 300px;
  height: 100%;
  margin-bottom: 8px;
}

.article-content {
  color: rgb(96, 88, 83);
}

.author {
  color: gray;
}

.author-test {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 10px;
  color: rgb(188, 173, 184);
}

.date {
  font-size: 12px;
  color: #7f7878;
}
</style>

<style>
.clamped {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.read-more-wrapper {
  padding: 1rem;
  display: flex;
  justify-content: end;
  text-decoration: underline;
  color: rgb(133, 130, 123);
}

.char {
  display: inline-block;
}
</style>
