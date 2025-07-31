<template>
  <div class="container">
    <div class="title text-center mb-4">Articles</div>

    <v-btn color="primary" class="mb-4" @click="openDialog('add')"> 新增文章 </v-btn>

    <!-- 文章列表 -->
    <div class="mb-2">LIST</div>
    <div v-if="articles.length === 0" class="text-grey">目前尚無文章</div>

    <v-card v-for="article in articles" :key="article._id" class="card mb-3">
      <v-card-title class="d-flex justify-center align-center">
        <span class="font-weight-medium">{{ article.title }}</span>
      </v-card-title>
      <div class="d-flex justify-end mb-3">
        <v-btn
          v-if="article.author === user.id"
          size="small"
          variant="text"
          @click="openDialog('edit', article)"
          >編輯</v-btn
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
      <v-card-text class="article-content">{{ article.content }}</v-card-text>
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
        </v-btn>
        <span class="mr-4">{{ comments.length || 0 }}</span>
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
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useI18n } from 'vue-i18n'
import { useAxios } from '@/composables/axios'
import AddOrEditArticle from './components/addOrEditArticle.vue'
import ToggleLikeArticle from './components/toggleLikeArticle.vue'
import CommentArticle from './components/commentArticle.vue'
import { useUserStore } from '@/stores/user'

const user = useUserStore()
// console.log('目前登入者 ID:', user.id)

const { t } = useI18n()
const { apiAuth } = useAxios()
const createSnackbar = useSnackbar()

const articles = reactive([])

const showDialog = ref(false)
const dialogMode = ref('add')
const currentArticle = ref({})
const currentEditId = ref('')

const commentDialogVisible = ref(false)
const selectedArticleId = ref(null)
const comments = ref([])

function openCommitDialog(type, articleId) {
  if (type === 'comment') {
    selectedArticleId.value = articleId
    commentDialogVisible.value = true
  }
}

const getArticles = async () => {
  try {
    const { data } = await apiAuth.get('/article')
    articles.splice(0)
    articles.push(...data.result)
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
  background: linear-gradient(135deg, #ebe6ea 30%, #f1cef2 60%, #ecd1f2 80%);
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
  height: 20vh;
  color: rgb(41, 38, 36);
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
