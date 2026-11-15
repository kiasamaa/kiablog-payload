'use client'

import {
  FormSubmit,
  useConfig,
  useDocumentDrawerContext,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
  useHotkey,
  useOperation,
  useTranslation,
} from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'
import React, { useRef } from 'react'

/**
 * Payload 默认在新文档保存后跳到该文档的编辑页。
 * 媒体库是高频连续上传的场景，保存后回列表更顺手，所以这里接管 SaveButton：
 * 仅「新建」成功后返回列表，编辑已有记录仍然留在当前页。
 */
const PENDING_SUCCESS_TOAST_KEY = 'payload-pending-success-toast'

type Props = {
  label?: string
}

export const MediaSaveButton: React.FC<Props> = ({ label: labelProp }) => {
  const { uploadStatus } = useDocumentInfo()
  const { drawerSlug } = useDocumentDrawerContext()
  const { t } = useTranslation()
  const { submit } = useForm()
  const modified = useFormModified()
  const editDepth = useEditDepth()
  const operation = useOperation()
  const router = useRouter()
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()

  const ref = useRef<HTMLButtonElement>(null)
  const label = labelProp || t('general:save')
  const disabled = (operation === 'update' && !modified) || uploadStatus === 'uploading'

  useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['s'] }, (event) => {
    event.preventDefault()
    event.stopPropagation()
    ref.current?.click()
  })

  const handleSubmit = async () => {
    if (uploadStatus === 'uploading') return

    const result = await submit()

    // 抽屉里（有 drawerSlug）新建媒体时不能跳走，否则会把用户从当前文档带走
    if (operation === 'create' && result?.res?.ok && !drawerSlug) {
      // Edit 视图会先写入这条待展示的成功提示并跳到文档页，这里改去列表，顺手清掉提示
      window.sessionStorage.removeItem(PENDING_SUCCESS_TOAST_KEY)
      router.replace(formatAdminURL({ adminRoute, path: '/collections/media' }))
    }
  }

  return (
    <FormSubmit
      buttonId="action-save"
      disabled={disabled}
      onClick={handleSubmit}
      ref={ref}
      size="medium"
      type="button"
    >
      {label}
    </FormSubmit>
  )
}

export default MediaSaveButton
