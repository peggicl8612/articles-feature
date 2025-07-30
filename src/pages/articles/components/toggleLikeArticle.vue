<template>
  <span style="cursor:pointer;" @click="toggleLike">
    <slot :liked="liked" :likes="likes"></slot>
  </span>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useAxios } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

const props = defineProps({
  articleId: String,
  initialLiked: Boolean,
  initialLikeCount: Number
})
const emit = defineEmits(['update'])

const { apiAuth } = useAxios()
const createSnackbar = useSnackbar()

const liked = ref(props.initialLiked)
const likes = ref(props.initialLikeCount)

watch(() => props.initialLiked, v => liked.value = v)
watch(() => props.initialLikeCount, v => likes.value = v)

const toggleLike = async () => {
  try {
    if (!liked.value) {
      await apiAuth.post(`/article/${props.articleId}/like`)
      liked.value = true
      likes.value++
    } else {
      await apiAuth.delete(`/article/${props.articleId}/like`)
      liked.value = false
      likes.value--
    }
    emit('update', liked.value, likes.value)
  } catch (error) {
    console.log(error)
    createSnackbar({ text: '操作失敗', snackbarProps: { color: 'red' } })
  }
}
</script>
