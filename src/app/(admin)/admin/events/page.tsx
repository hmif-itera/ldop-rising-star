import { catalogService } from '@/modules/event-catalog';
import { Button } from '@/modules/shared';
import {
  createArtistAction,
  createScheduleAction,
  deleteScheduleAction,
  createAnnouncementAction,
} from './actions';
import { Plus, Trash2, Calendar, Music, Bell } from 'lucide-react';

export default async function AdminEventsPage() {
  const event = await catalogService.getActiveEvent();
  const artists = await catalogService.listArtists(false);
  const stages = event ? await catalogService.listStages(event.id) : [];
  const schedules = event ? await catalogService.getSchedule(event.id) : [];
  const announcements = event ? await catalogService.listAnnouncements(event.id) : [];

  return (
    <div className="space-y-10 max-w-6xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Manajemen Katalog Acara</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Kelola line-up artis, sesi jadwal panggung (rundown), dan pengumuman resmi festival.
        </p>
      </div>

      {/* Grid: Artis & Pengumuman Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Tambah Artis */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg text-foreground border-b pb-3">
            <Music className="h-5 w-5 text-primary" />
            <h2>Tambah Artis / Penampil</h2>
          </div>
          <form action={async (formData) => {
            'use server';
            await createArtistAction(null, formData);
          }} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Nama Artis / Band *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                placeholder="Contoh: Feast, Bernadya, dll."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Genre</label>
                <input
                  type="text"
                  name="genre"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                  placeholder="Indie Rock, Pop, dll."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">URL Foto</label>
                <input
                  type="url"
                  name="photo_url"
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Biografi Singkat</label>
              <textarea
                name="bio"
                rows={2}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                placeholder="Deskripsi singkat artis..."
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" name="is_active" id="is_active" defaultChecked className="rounded" />
              <label htmlFor="is_active" className="text-xs font-medium">Tampilkan di Line-up Publik</label>
            </div>
            <Button type="submit" size="sm" className="w-full mt-2">
              <Plus className="h-4 w-4 mr-1" /> Simpan Artis
            </Button>
          </form>
        </section>

        {/* Form Buat Pengumuman */}
        <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-lg text-foreground border-b pb-3">
            <Bell className="h-5 w-5 text-primary" />
            <h2>Terbitkan Pengumuman</h2>
          </div>
          <form action={async (formData) => {
            'use server';
            await createAnnouncementAction(null, formData);
          }} className="space-y-3">
            <input type="hidden" name="event_id" value={event?.id ?? ''} />
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Judul Pengumuman *</label>
              <input
                type="text"
                name="title"
                required
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                placeholder="Contoh: Info Penukaran Gelang Tiket"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Isi Pengumuman *</label>
              <textarea
                name="body"
                required
                rows={4}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                placeholder="Tuliskan informasi penting untuk penonton..."
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" name="is_pinned" id="is_pinned" className="rounded" />
              <label htmlFor="is_pinned" className="text-xs font-medium">Sematkan sebagai Pengumuman Penting (Pinned)</label>
            </div>
            <Button type="submit" size="sm" variant="secondary" className="w-full mt-2">
              <Plus className="h-4 w-4 mr-1" /> Terbitkan Pengumuman
            </Button>
          </form>

          {announcements.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">Pengumuman Aktif ({announcements.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {announcements.map((ann) => (
                  <div key={ann.id} className="text-xs p-2 rounded bg-muted/40 border">
                    <span className="font-bold">{ann.title}</span>
                    {ann.is_pinned && <span className="ml-2 text-emerald-600 font-semibold">[PINNED]</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Form Tambah Sesi Jadwal (dengan validasi bentrok FR-CAT-07) */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-lg text-foreground border-b pb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h2>Tambah Sesi Jadwal Penampil (Rundown)</h2>
        </div>
        <form action={async (formData) => {
          'use server';
          await createScheduleAction(null, formData);
        }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="hidden" name="event_id" value={event?.id ?? ''} />

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Panggung *</label>
            <select name="stage_id" required className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm">
              <option value="">Pilih Panggung</option>
              {stages.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Artis Penampil *</label>
            <select name="artist_id" required className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm">
              <option value="">Pilih Artis</option>
              {artists.map((ar) => (
                <option key={ar.id} value={ar.id}>{ar.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Catatan / Special Act</label>
            <input
              type="text"
              name="notes"
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
              placeholder="Contoh: Opening Act"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Waktu Mulai (ISO) *</label>
            <input
              type="datetime-local"
              name="starts_at"
              required
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Waktu Selesai (ISO) *</label>
            <input
              type="datetime-local"
              name="ends_at"
              required
              className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" size="sm" className="w-full h-10">
              <Plus className="h-4 w-4 mr-1" /> Simpan Sesi Jadwal
            </Button>
          </div>
        </form>
      </section>

      {/* Tabel Sesi Jadwal Aktif */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-foreground border-b pb-3">Daftar Jadwal Penampil Terjadwal</h2>
        {schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Belum ada sesi jadwal yang dibuat.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Panggung</th>
                  <th className="px-4 py-3">Artis</th>
                  <th className="px-4 py-3">Waktu Mulai</th>
                  <th className="px-4 py-3">Waktu Selesai</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {schedules.map((sc) => (
                  <tr key={sc.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{sc.stage_name}</td>
                    <td className="px-4 py-3 font-bold">{sc.artist_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(sc.starts_at).toLocaleTimeString('id-ID')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(sc.ends_at).toLocaleTimeString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <form action={async () => {
                        'use server';
                        await deleteScheduleAction(sc.id);
                      }}>
                        <Button type="submit" variant="destructive" size="sm" className="h-7 px-2">
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
