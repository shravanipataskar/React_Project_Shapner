function FormField({ id, label, type = 'text', name, required = false }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} name={name ?? id} type={type} required={required} />
    </div>
  )
}

export default FormField
