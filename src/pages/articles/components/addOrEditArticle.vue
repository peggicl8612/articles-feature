<template>
  <v-dialog v-model="showDialog" max-width="600">
    <v-form @submit.prevent="submit">
      <v-card>
        <v-card-title class="text-h6">
          {{ dialogMode === 'add' ? '新增文章' : '編輯文章' }}
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="title.value.value"
            label="標題"
            placeholder="請輸入標題"
            variant="outlined"
            density="compact"
            :error-messages="errors.title"
          />
          <v-textarea
            v-model="content.value.value"
            label="內容"
            placeholder="請輸入內容"
            rows="4"
            variant="outlined"
            density="compact"
            :error-messages="errors.content"
          />
          <VueFileAgent
            ref="fileAgent"
            v-model="fileRecords"
            v-model:raw-model-value="rawFileRecords"
            accept="image/jpeg,image/jpg,image/png"
            deletable
            max-size="1MB"
            :help-text="$t('fileAgent.helpText')"
            :error-text="{ type: $t('fileAgent.errorType'), size: $t('fileAgent.errorSize') }"
          >
          </VueFileAgent>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" :loading="isSubmitting" type="submit">送出</v-btn>
          <v-btn text @click="closeDialog">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSnackbar } from 'vuetify-use-dialog'
import { useI18n } from 'vue-i18n'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useAxios } from '@/composables/axios'
// import { FileRecord } from 'vue-file-agent'

const { t } = useI18n()
const { apiAuth } = useAxios()
const createSnackbar = useSnackbar()

const emit = defineEmits(['close', 'refresh'])

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: 'add',
  },
  article: {
    type: Object,
    default: () => ({}),
  },
})

const showDialog = ref(false)
const dialogMode = ref('add')
const currentEditId = ref('')

const schema = yup.object({
  title: yup.string().required(t('api.articleTitleRequired')),
  content: yup.string().required(t('api.articleContentRequired')),
})

const { handleSubmit, isSubmitting, resetForm, errors, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    title: '',
    content: '',
  },
})

const title = useField('title')
const content = useField('content')

const fileAgent = ref(null)
const fileRecords = ref([])
const rawFileRecords = ref([])

/* const existImage = (imageUrl) => {
  const fileRecord = new FileRecord({
    name: '已上傳圖片',
    size: 123456,
    type: 'image/jpeg',
    url: imageUrl,
  })
  fileRecords.value = [fileRecord]
} */

const closeDialog = () => {
  showDialog.value = false
}

const submit = handleSubmit(async (values) => {
  console.log('submit mode:', dialogMode.value)
  console.log('currentEditId:', currentEditId.value)

  // 檢查是否有檔案錯誤
  if (fileRecords.value[0]?.error) {
    createSnackbar({
      text: '檔案上傳有誤',
      snackbarProps: {
        color: 'red',
      },
    })
    return
  }

  // 新增文章時必須上傳圖片
  if (dialogMode.value === 'add' && fileRecords.value.length === 0) {
    createSnackbar({
      text: t('api.articleImageRequired'),
      snackbarProps: {
        color: 'red',
      },
    })
    return
  }

  try {
    const fd = new FormData()

    fd.append('title', values.title)
    fd.append('content', values.content)
    if (fileRecords.value.length > 0 && fileRecords.value[0].source !== 'server') {
      fd.append('image', fileRecords.value[0].file)
    }

    // 用 dialogMode 判斷是新增還是編輯
    if (dialogMode.value === 'edit' && currentEditId.value.length > 0) {
      await apiAuth.patch('/article/' + currentEditId.value, fd)
    } else {
      await apiAuth.post('/article', fd)
    }

    createSnackbar({
      text: dialogMode.value === 'add' ? '新增成功' : '編輯成功',
      snackbarProps: {
        color: 'green',
      },
    })

    closeDialog()
    emit('refresh')
  } catch (error) {
    console.log(error)
    createSnackbar({
      text: t('api.' + (error?.response?.data?.message || 'unknownError')),
      snackbarProps: {
        color: 'red',
      },
    })
  }
})
// 監聽 props 變化
watch(
  () => props.show,
  (newVal) => {
    showDialog.value = newVal
  },
)

watch(
  () => props.mode,
  (newVal) => {
    dialogMode.value = newVal
  },
)

watch(
  () => props.article,
  (newVal) => {
    if (newVal && Object.keys(newVal).length > 0) {
      currentEditId.value = newVal._id || newVal.id || ''
      setFieldValue('title', newVal.title)
      setFieldValue('content', newVal.content)
    }
    if (newVal.image) {
      fileRecords.value = [
        {
          name: '已上傳圖片',
          type: 'image/jpeg',
          url: newVal.image,
          source: 'server',
          id: 'existing-image',
        },
      ]
    }
  },
)

// 監聽 dialog 狀態變化
watch(showDialog, (newVal) => {
  if (!newVal) {
    emit('close')
    resetForm()
    fileRecords.value = []
    rawFileRecords.value = []
  }
})
/* onMounted(() => {
  if (isEditMode.value && article.value.imageUrl) {
    existImage(articles.value.imageUrl)
  }
}) */
</script>
