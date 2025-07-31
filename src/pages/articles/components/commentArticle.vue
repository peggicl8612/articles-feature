<template>
  <v-dialog v-model="dialogVisible" width="80vw" height="80vh">
    <v-card>
      <v-card-title class="text-h6">留言</v-card-title>

      <v-card-text v-if="comments.length">
        <div v-for="comment in comments" :key="comment._id" class="mb-2">
          <div class="author-line">
            <div>作者：{{ comment.author?._id || '匿名' }}</div>
            <div v-if="comment.author?._id === user.id">
              <template v-if="editingMap[comment._id] !== undefined">
                <v-btn @click="saveEditedComment(comment._id)">儲存</v-btn>
                <v-btn @click="cancelEdit(comment._id)">取消</v-btn>
              </template>
              <template v-else>
                <v-btn @click="startEdit(comment._id, comment.content)">編輯</v-btn>
              </template>
            </div>
          </div>
          <div>
            <template v-if="editingMap[comment._id] !== undefined">
              <v-textarea
                v-model="editingMap[comment._id]"
                auto-grow
                hide-details
                density="compact"
                variant="outlined"
              />
            </template>
            <template v-else>
              {{ comment.content }}
            </template>
          </div>
        </div>
      </v-card-text>

      <v-card-text v-else-if="!loading">尚無留言</v-card-text>

      <v-card-text class="new-comment">
        <v-textarea v-model="newComment" label="請輸入留言" />
      </v-card-text>
      <v-card-actions class="submit-comment">
        <v-btn :loading="isSubmitting" @click="submitComment">送出</v-btn>
        <v-btn :loading="isSubmitting" @click="cancelComment">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAxios } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'
import { useUserStore } from '@/stores/user'

const user = useUserStore()

const { apiAuth } = useAxios()
const createSnackbar = useSnackbar()

const props = defineProps({
  visible: Boolean,
  articleId: String,
})

const emit = defineEmits(['update:visible'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const newComment = ref('')
const comments = ref([])
const isSubmitting = ref(false)
const loading = ref(false)
const editingMap = ref({})

async function getComments() {
  if (!props.articleId) return
  loading.value = true
  try {
    const res = await apiAuth.get(`/article/${props.articleId}/comment`)
    comments.value = res.data
  } catch (err) {
    console.error('留言載入失敗', err)
  } finally {
    loading.value = false
  }
}

function startEdit(id, content) {
  editingMap.value[id] = content
}

function cancelEdit(id) {
  delete editingMap.value[id]
}

async function saveEditedComment(id) {
  const content = editingMap.value[id].trim()
  if (!content) {
    createSnackbar({ text: '留言內容為空', snackbarProps: { color: 'red' } })
    return
  }

  isSubmitting.value = true
  try {
    await apiAuth.patch(`/article/${props.articleId}/comment/${id}`, { content })
    createSnackbar({ text: '編輯成功', snackbarProps: { color: 'gray' } })
    await getComments()
    delete editingMap.value[id]
  } catch (error) {
    console.error('編輯失敗', error)
    createSnackbar({ text: '編輯失敗', snackbarProps: { color: 'red' } })
  } finally {
    isSubmitting.value = false
  }
}

async function submitComment() {
  if (!newComment.value.trim()) {
    createSnackbar({
      text: '留言內容為空',
      snackbarProps: { color: 'red' },
    })
    return
  }

  isSubmitting.value = true
  try {
    await apiAuth.post(`/article/${props.articleId}/comment`, {
      content: newComment.value,
    })
    createSnackbar({
      text: '留言成功',
      snackbarProps: { color: 'gray' },
    })
    await getComments()
    newComment.value = ''
  } catch (error) {
    console.log('留言失敗', error)
    createSnackbar({
      text: '留言失敗',
      snackbarProps: { color: 'red' },
    })
  } finally {
    isSubmitting.value = false
  }
}

function cancelComment() {
  dialogVisible.value = false
}

watch(
  () => dialogVisible.value,
  (visible) => {
    if (visible) getComments()
  },
)
</script>

<style scoped>
.new-comment {
  display: flex;
  justify-content: end;
  align-items: end;
}

.submit-comment {
  display: flex;
  justify-content: center;
  align-items: center;
}

.author-line {
  display: flex;
  justify-content: space-between;
  gap: 10rem;
}
</style>
