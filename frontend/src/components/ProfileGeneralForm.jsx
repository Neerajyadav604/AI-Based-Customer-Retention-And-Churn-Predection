import Button from './Button'
import Spinner from './Spinner'
import UserAvatar from './UserAvatar'

const businessTypes = ['Kirana store', 'Online seller', 'Local vendor', 'Other']

// Check the selected image before sending it to Cloudinary.
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

// Edit profile details and upload the user's photo.
export default function ProfileGeneralForm({ profile, onChange, onSave, onPhoto, uploadPhotoRequest, saving, photoLoading }) {
  async function handlePhoto(event) {
    const file = event.target.files[0]
    if (file) await onPhoto(uploadPhoto(file, uploadPhotoRequest))
    event.target.value = ''
  }

  return (
    <form onSubmit={onSave} className="grid gap-5">
      <h2 className="text-lg font-semibold text-slate-900">General Information</h2>
      <div className="flex items-center gap-4">
        <UserAvatar user={profile} size="size-16" />
        <div>
          <label className="inline-flex cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-within:ring-2 focus-within:ring-indigo-600">
            Upload Photo
            <input type="file" accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif" onChange={handlePhoto} className="sr-only" />
          </label>
          <p className="mt-2 text-xs text-slate-500">JPG, PNG or GIF • Max size 2MB</p>
          {photoLoading && <p className="mt-2 text-sm text-indigo-600"><Spinner label="Uploading..." /></p>}
        </div>
      </div>
      <p className="text-xs font-semibold tracking-wider text-slate-500">BASIC INFO</p>
      <label className="grid gap-1 text-sm font-medium text-slate-700">Name
        <input name="name" value={profile.name} onChange={onChange} minLength="2" maxLength="60" required className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">Email
        <input value={profile.email} readOnly className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">Phone
        <input name="phone" value={profile.phone} onChange={onChange} placeholder="Optional" className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">Business name
        <input name="business_name" value={profile.business_name} onChange={onChange} maxLength="80" placeholder="Optional" className="rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20" />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">Business type
        <select name="business_type" value={profile.business_type} onChange={onChange} className="rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20">
          <option value="">Select a type</option>
          {businessTypes.map((type) => <option key={type}>{type}</option>)}
        </select>
      </label>
      <Button type="submit" disabled={saving}>{saving ? <Spinner label="Saving..." /> : 'Save changes'}</Button>
    </form>
  )
}
