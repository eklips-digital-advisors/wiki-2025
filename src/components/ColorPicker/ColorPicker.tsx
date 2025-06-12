'use client'

import { useField, TextInput } from '@payloadcms/ui'
import styles from './ColorPicker.module.css'

const ColorPicker = ({
  field: { label, required = false },
  path,
}: {
  field: { label: string; required?: boolean }
  path: string
}) => {
  const { value, setValue } = useField<string>({ path })

  return (
    <div>
      <label className="field-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <div className={styles.colorPickerRow}>
        <input type="color" value={value} onChange={(e) => setValue(e.target.value)} />
        <TextInput
          label=""
          path={path}
          onChange={(e: { target: { value: string } }) => setValue(e.target.value)}
          value={value}
        />
      </div>
    </div>
  )
}

export default ColorPicker
