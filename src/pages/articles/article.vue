<template>
  <div class="container">
    <h1 class="text-h3 text-center mb-4">Articles</h1>

    <v-btn color="primary" class="mb-4" @click="openDialog('add')">
      新增文章
    </v-btn>

    <!-- 文章列表 -->
    <h2 class="text-h6 mb-2">文章列表</h2>
    <div v-if="articles.length === 0" class="text-grey">目前尚無文章</div>

    <v-card
      v-for="(article, index) in articles"
      :key="index"
      class="card mb-3"
    >
      <v-card-title class="d-flex justify-center align-center">
        <span class="font-weight-medium">{{ article.title }}</span>
      </v-card-title>
      <div class="d-flex justify-end mb-3">
      <v-btn size="small" variant="text" @click="openDialog('edit', article)">編輯</v-btn>
      </div>
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
      <v-btn icon @click="toggleLike(article)">
        <v-icon :color="article.liked ? 'red' : 'grey'">
      {{ article.liked ? 'mdi-heart' : 'mdi-heart-outline' }}
        </v-icon>
      </v-btn>
      <span class="mr-4">{{ article.likes || 0 }}</span>
      <v-btn icon @click="openDialog('comment', article)">
        <v-icon>mdi-comment-outline</v-icon>
      </v-btn>
      <span class="mr-4">{{ article.comments?.length || 0 }}</span>
<!--       <v-btn icon @click="shareArticle(article)">
        <v-icon>mdi-share-variant</v-icon>
      </v-btn> -->
    </v-card-actions>
    </v-card>

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
import { reactive, ref } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useI18n } from 'vue-i18n'
import { useAxios } from '@/composables/axios'
import AddOrEditArticle from './components/addOrEditArticle.vue'

const { t } = useI18n()
const { apiAuth } = useAxios()
const createSnackbar = useSnackbar()

const articles = reactive([])

const showDialog = ref(false)
const dialogMode = ref('add')
const currentArticle = ref({})

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
        color: 'red'
      }
    })
  }
}

const openDialog = (mode, article = null) => {
  dialogMode.value = mode
  showDialog.value = true

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
</script>

<style scoped>
.container {
  margin: 0 auto;
  padding: 4vw;
}
.container h1 {
  font-weight: bolder;
  color: rgb(74, 67, 60);
}
.card{
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


</style>
