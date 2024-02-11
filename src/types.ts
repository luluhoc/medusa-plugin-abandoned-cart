export interface PluginOptions {
  /* email from which you will be sending */
  from: string
  /* template id from sendgrid */
  templateId: string
  /* subject of the email optional */
  subject?: string
}