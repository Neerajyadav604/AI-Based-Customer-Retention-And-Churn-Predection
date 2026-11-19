import Button from './Button'
import Spinner from './Spinner'
import UserAvatar from './UserAvatar'

const businessTypes = ['Kirana store', 'Online seller', 'Local vendor', 'Other']

async function uploadPhoto(file, uploadPhotoRequest) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  const extension = file.name.toLowerCase().split('.').pop()
  if (!validTypes.includes(file.type) && !['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    throw new Error('Choose a JPG, PNG, or GIF image.')
  }
  if (file.size > 2 * 1024 * 1024) throw new Error('The photo must be 2MB or smaller.')
  const result = await uploadPhotoRequest(file)
  if (!result.photo_url) throw new Error('Photo upload failed. Please try again.')
  return result.photo_url
}

export default function ProfileGeneralForm({
  profile,
  onChange,
  onSubmit,
  onPhotoChange,
  saving,
  photoLoading,
}) {
  async function handlePhoto(event) {
    const file = event.target.files[0]
    if (file && onPhotoChange) {
      await onPhotoChange(uploadPhoto(file, onPhotoChange))
    }
    event.target.value = ''
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {/* Avatar Section */}
      <div className="flex items-center gap-5 border-b border-[#EBC69F]/40 pb-5">
        <UserAvatar user={profile} size="size-20" className="ring-4 ring-[#EBC69F]/60 shadow-md" />
        <div>
          <label className="inline-flex cursor-pointer rounded-2xl bg-[#494269] px-4 py-2 text-xs font-semibold text-[#FFF3E4] shadow-sm hover:bg-[#373152] transition btn-interactive">
            Upload Photo
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
              onChange={handlePhoto}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-[11px] text-[#392D35]">JPG, PNG or GIF • Max size 2MB</p>
          {photoLoading && <p className="mt-2 text-xs text-[#494269]"><Spinner label="Uploading photo..." /></p>}
        </div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wider text-[#494269]">Personal Information</p>

      {/* Form Fields: Deep high-contrast font colors (#291C2E) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[#291C2E]">
          Full Name
          <input
            name="name"
            value={profile.name}
            onChange={(e) => onChange('name', e.target.value)}
            minLength="2"
            maxLength="60"
            required
            className="w-full rounded-2xl border border-[#EBC69F] bg-[#FFF3E4] px-4 py-2.5 text-sm font-semibold text-[#291C2E] focus:border-[#494269] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#494269]/15 shadow-inner"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[#291C2E]">
          Email Address
          <input
            value={profile.email}
            readOnly
            className="w-full rounded-2xl border border-[#EBC69F]/50 bg-[#FFF8ED]/60 px-4 py-2.5 text-sm font-mono font-medium text-[#392D35] cursor-not-allowed"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[#291C2E]">
          Phone Number
          <input
            name="phone"
            value={profile.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Optional (+91)"
            className="w-full rounded-2xl border border-[#EBC69F] bg-[#FFF3E4] px-4 py-2.5 text-sm font-semibold text-[#291C2E] placeholder-[#A99BB9] focus:border-[#494269] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#494269]/15 shadow-inner"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[#291C2E]">
          Business Name
          <input
            name="business_name"
            value={profile.business_name}
            onChange={(e) => onChange('business_name', e.target.value)}
            maxLength="80"
            placeholder="Store or shop name"
            className="w-full rounded-2xl border border-[#EBC69F] bg-[#FFF3E4] px-4 py-2.5 text-sm font-semibold text-[#291C2E] placeholder-[#A99BB9] focus:border-[#494269] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#494269]/15 shadow-inner"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-[#291C2E] sm:col-span-2">
          Business Type
          <select
            name="business_type"
            value={profile.business_type}
            onChange={(e) => onChange('business_type', e.target.value)}
            className="w-full rounded-2xl border border-[#EBC69F] bg-[#FFF3E4] px-4 py-2.5 text-sm font-semibold text-[#291C2E] focus:border-[#494269] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#494269]/15 shadow-inner"
          >
            <option value="">Select a category</option>
            {businessTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={saving} variant="primary" size="md">
          {saving ? <Spinner label="Saving profile..." /> : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
