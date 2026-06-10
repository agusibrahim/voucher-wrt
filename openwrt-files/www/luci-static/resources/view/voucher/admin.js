'use strict';
'require view';
'require fs';
'require ui';
'require uci';
'require rpc';

var uciCommit = rpc.declare({
	object: 'uci',
	method: 'commit',
	params: [ 'config' ],
	reject: true
});

return view.extend({
	// Load data before rendering
	load: function() {
		return Promise.all([
			L.resolveDefault(fs.read('/etc/voucher/vouchers'), ''),
			L.resolveDefault(fs.read('/etc/voucher/sessions'), ''),
			L.resolveDefault(fs.read('/etc/freewifi/sessions'), ''),
			L.resolveDefault(fs.read('/etc/voucher/config'), ''),
			L.resolveDefault(fs.read('/etc/freewifi/config'), ''),
			uci.load('wireless'),
			uci.load('network'),
			uci.load('dhcp')
		]);
	},

	render: function(data) {
		let self = this;
		let lang = L.env.lang || 'en';
		let id_dict = {
			'Refresh': 'Refresh',
			'Refresh Sessions': 'Refresh Sesi',
			'Status refreshed successfully.': 'Status berhasil di-refresh.',
			'Active sessions refreshed successfully.': 'Sesi aktif berhasil di-refresh.',
			'Voucher WiFi & Free Internet Dashboard': 'Dashboard Voucher WiFi & Internet Gratis',
			'Manage vouchers, monitor active user sessions, and configure SSIDs and network speed limits.': 'Kelola voucher, pantau sesi pengguna aktif, dan atur SSID serta batas kecepatan internet.',
			'Status & Info': 'Status & Informasi',
			'Manage Vouchers': 'Kelola Voucher',
			'Active Sessions': 'Sesi Aktif',
			'Network & Speed Settings': 'Pengaturan Jaringan & Kecepatan',
			'Portal Customizer': 'Kustomisasi Portal',
			'WiFi Portal Status': 'Status Portal WiFi',
			'Voucher WiFi SSID': 'SSID Voucher WiFi',
			'Free WiFi SSID': 'SSID Internet Gratis',
			'Available Vouchers': 'Total Voucher Tersedia',
			'Active Voucher Sessions': 'Total Sesi Voucher Aktif',
			'Active Free WiFi Sessions': 'Total Sesi Free WiFi Aktif',
			'Voucher Speed Limit': 'Batas Kecepatan Voucher',
			'Free WiFi Speed Limit': 'Batas Kecepatan Internet Gratis',
			'Reloading services...': 'Memuat ulang layanan...',
			'Reapplying firewall rules and traffic shaping.': 'Sedang menerapkan ulang aturan firewall dan lalu lintas jaringan.',
			'Services reloaded successfully!': 'Layanan berhasil dimuat ulang!',
			'Restart Services & Apply Rules': 'Restart Layanan & Terapkan Aturan',
			'Generate Vouchers (Bulk)': 'Buat Voucher Masal (Bulk)',
			'Voucher Count': 'Jumlah Voucher',
			'Duration (Minutes)': 'Durasi (Menit)',
			'Max Devices': 'Maks Perangkat',
			'Max Quota (MB)': 'Kuota Maks (MB)',
			'Note': 'Catatan',
			'Generating Vouchers...': 'Membuat Voucher...',
			'Generating random bulk voucher codes.': 'Membuat kode voucher masal secara acak.',
			'Bulk vouchers generated successfully!': 'Voucher masal berhasil dibuat!',
			'Generate Bulk Vouchers': 'Buat Voucher Masal',
			'WiFi Vouchers List': 'Daftar Voucher WiFi',
			'Search: ': 'Cari: ',
			'Search code / notes...': 'Cari kode / catatan...',
			'Are you sure you want to delete all WiFi vouchers?': 'Apakah Anda yakin ingin menghapus semua voucher WiFi?',
			'Clearing Vouchers...': 'Membersihkan Voucher...',
			'Deleting all voucher codes.': 'Menghapus semua kode voucher.',
			'All vouchers have been deleted.': 'Semua voucher telah dihapus.',
			'Delete All Vouchers': 'Hapus Semua Voucher',
			'Voucher Code': 'Kode Voucher',
			'Duration': 'Durasi',
			'Status': 'Status',
			'Action': 'Aksi',
			'No vouchers found': 'Tidak ada voucher ditemukan',
			'Used': 'Digunakan',
			'New': 'Baru',
			'Delete voucher %s?': 'Hapus voucher %s?',
			'Deleting Voucher...': 'Menghapus Voucher...',
			'Deleting voucher.': 'Sedang menghapus voucher.',
			'Voucher %s successfully deleted.': 'Voucher %s berhasil dihapus.',
			'Delete': 'Hapus',
			'Previous': 'Sebelumnya',
			'Page %s of %s (Total: %s)': 'Halaman %s dari %s (Total: %s)',
			'Next': 'Berikutnya',
			'Search IP / MAC / Voucher...': 'Cari IP / MAC / Voucher...',
			'Remaining Time': 'Sisa Waktu',
			'Data Usage': 'Pemakaian Data',
			'No active voucher sessions': 'Tidak ada sesi voucher aktif',
			'Disconnect client %s (%s)?': 'Putuskan koneksi client %s (%s)?',
			'Disconnecting Client...': 'Memutuskan Koneksi...',
			'Removing session and clearing firewall rules.': 'Menghapus sesi dan menghapus element firewall.',
			'Connection %s successfully disconnected.': 'Koneksi %s berhasil diputuskan.',
			'Disconnect': 'Putuskan',
			'Search Name / Phone / IP...': 'Cari Nama / No HP / IP...',
			'Name': 'Nama',
			'Phone Number': 'No. Telepon',
			'No active Free WiFi sessions': 'Tidak ada sesi Free WiFi aktif',
			'Disconnect Free WiFi %s?': 'Putuskan koneksi Free WiFi %s?',
			'SSID & Network Configuration': 'Konfigurasi SSID & Jaringan',
			'SSID and wireless settings are saved to the UCI system configuration.': 'SSID dan pengaturan IP nirkabel ini disimpan ke file UCI system.',
			'Free Internet SSID': 'SSID Internet Gratis',
			'Speed Limits & Duration': 'Batas Kecepatan & Durasi',
			'Configure speed limits in flat Mbps and the active session duration for Free WiFi.': 'Mengatur batas kecepatan dalam satuan Mbps langsung dan masa aktif sesi Free WiFi.',
			'Voucher Download Speed Limit (Mbps)': 'Batas Download Voucher (Mbps)',
			'Voucher Upload Speed Limit (Mbps)': 'Batas Upload Voucher (Mbps)',
			'Free WiFi Download Speed Limit (Mbps)': 'Batas Download Free WiFi (Mbps)',
			'Free WiFi Upload Speed Limit (Mbps)': 'Batas Upload Free WiFi (Mbps)',
			'Free WiFi Session Duration (Minutes)': 'Durasi Sesi Free WiFi (Menit)',
			'Free WiFi Max Quota (MB)': 'Kuota Maks Free WiFi (MB)',
			'Set to 0 for unlimited data.': 'Isi 0 untuk tanpa batas kuota.',
			'Saving Settings...': 'Menyimpan Pengaturan...',
			'Saving to wireless UCI and writing controller configuration files.': 'Menyimpan ke UCI nirkabel dan menulis konfigurasi controller.',
			'Settings saved successfully!': 'Pengaturan berhasil disimpan!',
			'Failed to save settings: %s': 'Gagal menyimpan pengaturan: %s',
			'Save & Apply': 'Simpan & Terapkan',
			'Expired': 'Expired',
			'Voucher %s deleted successfully.': 'Voucher %s berhasil dihapus.',
			'Disconnect Free WiFi user %s?': 'Putuskan koneksi Free WiFi %s?',
			'Client %s disconnected.': 'Koneksi %s berhasil diputuskan.',
			'Search:': 'Cari:',
			'Portal Customizer': 'Kustomisasi Portal',
			'Voucher WiFi Portal Design': 'Desain Portal Voucher WiFi',
			'Customize the texts, colors, and styles of the Voucher WiFi landing page.': 'Kustomisasi teks, warna, dan gaya tampilan halaman login Voucher WiFi.',
			'Portal Title': 'Judul Portal',
			'Portal Description': 'Deskripsi Portal',
			'Footer / Instructions Note': 'Catatan Kaki / Instruksi',
			'Login Button Text': 'Teks Tombol Login',
			'Background Color': 'Warna Latar Belakang',
			'Background Gradient (CSS)': 'Gradasi Latar Belakang (CSS)',
			'Font Color': 'Warna Font',
			'Accent / Button Color': 'Warna Aksen / Tombol',
			'Custom CSS (Override)': 'Kustom CSS (Override)',
			'Free WiFi Portal Design': 'Desain Portal Free WiFi',
			'Customize the texts, colors, and styles of the Free WiFi landing page.': 'Kustomisasi teks, warna, dan gaya tampilan halaman login Free WiFi.',
			'quota_unlimited': 'Unlimited',
			'AP Isolation': 'Isolasi AP',
			'Enable AP Isolation for Voucher WiFi': 'Aktifkan Isolasi AP untuk Voucher WiFi',
			'Enable AP Isolation for Free WiFi': 'Aktifkan Isolasi AP untuk Free WiFi',
			'Disconnects WiFi briefly when toggled.': 'Memutus WiFi sejenak saat diubah.',
			'Monthly Cap': 'Batas Pemakaian',
			'Active Users': 'Pengguna Aktif',
			'Total Consumed': 'Total Terpakai',
			'Bandwidth Usage': 'Pemakaian Bandwidth',
			'session_ratio': 'Rasio Sesi',
			'Voucher Users': 'Voucher',
			'Free Users': 'Free WiFi',
			'FreeWiFi': 'Free WiFi'
		};

		let _ = function(str) {
			if (lang === 'id' && id_dict[str] !== undefined) {
				return id_dict[str];
			}
			return window._ ? window._(str) : str;
		};

		let vouchersTxt = data[0];
		let voucherSessionsTxt = data[1];
		let freeSessionsTxt = data[2];
		let voucherConfigTxt = data[3];
		let freeConfigTxt = data[4];

		// Parse Configurations
		let parseShellConfig = function(txt) {
			let cfg = {};
			(txt || '').split('\n').forEach(line => {
				line = line.trim();
				if (!line || line.startsWith('#') || !line.includes('=')) return;
				let idx = line.indexOf('=');
				let k = line.substring(0, idx).trim();
				let v = line.substring(idx + 1).trim();
				if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
					v = v.substring(1, v.length - 1);
				}
				cfg[k] = v;
			});
			return cfg;
		};

		let voucherCfg = parseShellConfig(voucherConfigTxt);
		let freeCfg = parseShellConfig(freeConfigTxt);

		// Helper: format bytes to human-readable
		let formatBytes = function(bytes) {
			bytes = parseInt(bytes);
			if (isNaN(bytes) || bytes <= 0) return '0 B';
			let units = ['B', 'KB', 'MB', 'GB', 'TB'];
			let i = 0;
			let val = bytes;
			while (val >= 1024 && i < units.length - 1) {
				val /= 1024;
				i++;
			}
			return val.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
		};

		// Parse Vouchers (9-column: code|mins|maxdev|note|status|used_ip|used_mac|used_at|count|quota_mb)
		let parseVouchers = function(txt) {
			let list = [];
			(txt || '').trim().split('\n').forEach(line => {
				if (!line) return;
				let p = line.split('|');
				if (p.length >= 2) {
					list.push({
						code: p[0],
						minutes: p[1],
						max_devices: p[2] || '1',
						note: p[3] || '',
						status: p[4] || 'new',
						used_at: p[7] || '',
						quota_mb: p[9] || '0'
					});
				}
			});
			// Since newest vouchers are appended to the end, reverse list to show newest first
			list.reverse();
			return list;
		};

		// Parse Voucher Sessions (7-column: code|ip|mac|exp|left|max_quota_mb|used_bytes)
		let parseVoucherSessions = function(txt) {
			let list = [];
			(txt || '').trim().split('\n').forEach(line => {
				if (!line) return;
				let p = line.split('|');
				if (p.length >= 3) {
					list.push({
						code: p[0],
						ip: p[1],
						mac: p[2],
						expiry: p[3] || '0',
						max_quota_mb: p[4] || '0',
						used_bytes: p[5] || '0'
					});
				}
			});
			return list;
		};

		// Parse Free WiFi Sessions (8-column: ip|mac|name|phone|ts|left|max_quota_mb|used_bytes)
		let parseFreeSessions = function(txt) {
			let list = [];
			(txt || '').trim().split('\n').forEach(line => {
				if (!line) return;
				let p = line.split('|');
				if (p.length >= 4) {
					list.push({
						ip: p[0],
						mac: p[1],
						name: p[2],
						phone: p[3],
						timestamp: p[4] || '0',
						expiry: p[5] || '0',
						max_quota_mb: p[6] || '0',
						used_bytes: p[7] || '0'
					});
				}
			});
			return list;
		};

		let allVouchers = parseVouchers(vouchersTxt);
		let allVoucherSessions = parseVoucherSessions(voucherSessionsTxt);
		let allFreeSessions = parseFreeSessions(freeSessionsTxt);

		// Compute aggregated stats
		let computeStats = function() {
			let totalDataBytes = 0;
			let voucherDataBytes = 0;
			let freeDataBytes = 0;

			allVoucherSessions.forEach(s => {
				let b = parseInt(s.used_bytes) || 0;
				voucherDataBytes += b;
				totalDataBytes += b;
			});
			allFreeSessions.forEach(s => {
				let b = parseInt(s.used_bytes) || 0;
				freeDataBytes += b;
				totalDataBytes += b;
			});

			return {
				totalDataBytes: totalDataBytes,
				voucherDataBytes: voucherDataBytes,
				freeDataBytes: freeDataBytes,
				voucherSessionCount: allVoucherSessions.length,
				freeSessionCount: allFreeSessions.length,
				totalSessions: allVoucherSessions.length + allFreeSessions.length,
				voucherCount: allVouchers.length
			};
		};

		// Local state for pagination/searching
		let state = {
			vouchers: { page: 1, limit: 10, search: '', data: allVouchers },
			voucherSessions: { page: 1, limit: 10, search: '', data: allVoucherSessions },
			freeSessions: { page: 1, limit: 10, search: '', data: allFreeSessions }
		};

		// Helper to format remaining time
		let formatRemaining = function(exp) {
			let now = Math.floor(Date.now() / 1000);
			let val = parseInt(exp);
			if (isNaN(val)) return '-';
			let diff = val - now;
			if (diff <= 0) return E('span', { style: 'color:red;font-weight:bold;' }, _('Expired'));
			let h = Math.floor(diff / 3600);
			let m = Math.floor((diff % 3600) / 60);
			let s = diff % 60;
			return `${h}h ${m}m ${s}s`;
		};

		// Helper to format date
		let formatDate = function(ts) {
			if (!ts) return '-';
			let val = parseInt(ts);
			if (isNaN(val) || val <= 0) return '-';
			let d = new Date(val * 1000);
			if (isNaN(d.getTime())) return '-';
			return d.toLocaleString();
		};

		// Data usage progress bar component
		let dataUsageBar = function(usedBytes, maxQuotaMb) {
			usedBytes = parseInt(usedBytes) || 0;
			maxQuotaMb = parseInt(maxQuotaMb) || 0;
			let usedMb = usedBytes / (1024 * 1024);
			let pct = 0;
			let label = formatBytes(usedBytes);
			if (maxQuotaMb > 0) {
				pct = Math.min(100, (usedBytes / (maxQuotaMb * 1024 * 1024)) * 100);
				label = formatBytes(usedBytes) + ' / ' + maxQuotaMb + ' MB';
			} else {
				label = formatBytes(usedBytes) + ' / ' + _('quota_unlimited');
			}
			let barColor = pct > 90 ? '#dc2626' : (pct > 70 ? '#f59e0b' : '#0f766e');
			return E('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
				E('div', {
					style: 'flex: 1; height: 16px; background: #e5e7eb; border-radius: 8px; overflow: hidden; min-width: 80px;'
				}, [
					E('div', {
						style: `height: 100%; width: ${pct}%; background: ${barColor}; border-radius: 8px; transition: width 0.3s;`
					})
				]),
				E('span', { style: 'font-size: 11px; white-space: nowrap; color: #4b5563;' }, label)
			]);
		};

		// KPI Card component
		let kpiCard = function(title, value, subtitle, icon, color, ssidMode) {
			color = color || '#0f766e';
		var valStyle = ssidMode ? 'font-size: 14px; font-weight: 700; font-family: monospace; color: #111827; line-height: 1.3; word-break: break-all;' : 'font-size: 28px; font-weight: 700; color: ' + color + '; line-height: 1.2;';
			return E('div', {
				style: 'background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; ' +
					'display: flex; flex-direction: column; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);'
			}, [
				E('div', { style: 'display: flex; justify-content: space-between; align-items: flex-start;' }, [
					E('span', { style: 'font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;' }, title),
					icon ? E('span', { style: 'font-size: 20px;' }, icon) : ''
				]),
				E('span', { style: valStyle }, value),
				subtitle ? E('span', { style: 'font-size: 11px; color: #9ca3af;' }, subtitle) : ''
			]);
		};

		// Build DOM elements
		let container = E('div', { class: 'cbi-map' }, [
			E('h2', {}, _('Voucher WiFi & Free Internet Dashboard')),
			E('p', { class: 'cbi-map-descr' }, _('Manage vouchers, monitor active user sessions, and configure SSIDs and network speed limits.'))
		]);

		// Tab menu switcher
		let activeTab = 'status';
		let tabmenu = E('ul', { class: 'cbi-tabmenu' }, [
			E('li', { class: 'cbi-tab', 'data-tab': 'status', click: switchTab }, E('a', {}, _('Status & Info'))),
			E('li', { class: 'cbi-tab cbi-tab-disabled', 'data-tab': 'vouchers', click: switchTab }, E('a', {}, _('Manage Vouchers'))),
			E('li', { class: 'cbi-tab cbi-tab-disabled', 'data-tab': 'sessions', click: switchTab }, E('a', {}, _('Active Sessions'))),
			E('li', { class: 'cbi-tab cbi-tab-disabled', 'data-tab': 'settings', click: switchTab }, E('a', {}, _('Network & Speed Settings'))),
			E('li', { class: 'cbi-tab cbi-tab-disabled', 'data-tab': 'portal', click: switchTab }, E('a', {}, _('Portal Customizer')))
		]);

		container.appendChild(tabmenu);

		function switchTab(ev) {
			let tab = ev.currentTarget.getAttribute('data-tab');
			activeTab = tab;
			container.querySelectorAll('.cbi-tab').forEach(el => {
				el.classList.add('cbi-tab-disabled');
			});
			ev.currentTarget.classList.remove('cbi-tab-disabled');

			container.querySelectorAll('.voucher-tab-content').forEach(el => {
				el.style.display = 'none';
			});
			container.querySelector('#tab-' + tab).style.display = 'block';
		}

		function refreshData() {
			return Promise.all([
				L.resolveDefault(fs.read('/etc/voucher/vouchers'), ''),
				L.resolveDefault(fs.read('/etc/voucher/sessions'), ''),
				L.resolveDefault(fs.read('/etc/freewifi/sessions'), ''),
				uci.load('wireless')
			]).then(res => {
				allVouchers = parseVouchers(res[0]);
				allVoucherSessions = parseVoucherSessions(res[1]);
				allFreeSessions = parseFreeSessions(res[2]);

				state.vouchers.data = allVouchers;
				state.voucherSessions.data = allVoucherSessions;
				state.freeSessions.data = allFreeSessions;

				filterVouchers();
				filterVoucherSessions();
				filterFreeSessions();

				// Update Status tab - KPI cards
				let stats = computeStats();
				let vSsid = uci.get('wireless', 'voucher5', 'ssid') || 'Voucher WiFi';
				let fSsid = uci.get('wireless', 'freewifi', 'ssid') || 'KAYLA INTERNET GRATIS';

				let kpiContainer = container.querySelector('#kpi-cards');
				if (kpiContainer) {
					kpiContainer.innerHTML = '';
					let cards = buildKpiCards(stats, vSsid, fSsid);
					cards.forEach(c => kpiContainer.appendChild(c));
				}

				let ratioBar = container.querySelector('#session-ratio-bar');
				if (ratioBar) {
					ratioBar.innerHTML = '';
					ratioBar.appendChild(buildRatioBar(stats));
				}

				let bandwidthStats = container.querySelector('#bandwidth-stats');
				if (bandwidthStats) {
					bandwidthStats.innerHTML = '';
					bandwidthStats.appendChild(buildBandwidthStats(stats));
				}
			});
		}

		// ---- KPI Cards Builder ----
		function buildKpiCards(stats, vSsid, fSsid) {
			let totalSessions = stats.totalSessions;
			let totalDataStr = formatBytes(stats.totalDataBytes);
			return [
				kpiCard(_('Voucher WiFi SSID'), vSsid, '', '\u{1F3F4}', null, true),
				kpiCard(_('Free WiFi SSID'), fSsid, '', '\u{1F4F6}', null, true),
				kpiCard(_('Active Users'), totalSessions.toString(),
					stats.voucherSessionCount + ' ' + _('Voucher Users') + ' / ' + stats.freeSessionCount + ' ' + _('Free Users'), '\u{1F465}', '#2563eb'),
				kpiCard(_('Total Consumed'), totalDataStr,
					_('Available Vouchers') + ': ' + stats.voucherCount, '\u{1F4CA}', '#059669')
			];
		}

		// ---- Ratio Progress Bar ----
		function buildRatioBar(stats) {
			let total = stats.totalSessions || 1;
			let vPct = (stats.voucherSessionCount / total) * 100;
			let fPct = (stats.freeSessionCount / total) * 100;
			return E('div', { style: 'display: flex; flex-direction: column; gap: 8px;' }, [
				E('div', { style: 'display: flex; justify-content: space-between; font-size: 13px; color: #374151;' }, [
					E('span', {}, _('session_ratio')),
					E('span', {}, stats.voucherSessionCount + ' ' + _('Voucher Users') + ' / ' + stats.freeSessionCount + ' ' + _('Free Users'))
				]),
				E('div', { style: 'height: 24px; background: #e5e7eb; border-radius: 12px; overflow: hidden; display: flex;' }, [
					vPct > 0 ? E('div', {
						style: `height: 100%; width: ${vPct}%; background: #0f766e; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: 600; min-width: ${vPct > 5 ? '40' : '0'}px;`
					}, vPct > 5 ? Math.round(vPct) + '%' : '') : '',
					fPct > 0 ? E('div', {
						style: `height: 100%; width: ${fPct}%; background: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: 600; min-width: ${fPct > 5 ? '40' : '0'}px;`
					}, fPct > 5 ? Math.round(fPct) + '%' : '') : ''
				]),
				E('div', { style: 'display: flex; gap: 16px; font-size: 12px;' }, [
					E('span', {}, E('span', { style: 'display: inline-block; width: 10px; height: 10px; background: #0f766e; border-radius: 2px; margin-right: 4px;' }), _('Voucher Users'), ': ', stats.voucherSessionCount),
					E('span', {}, E('span', { style: 'display: inline-block; width: 10px; height: 10px; background: #2563eb; border-radius: 2px; margin-right: 4px;' }), _('Free Users'), ': ', stats.freeSessionCount)
				])
			]);
		}

		// ---- Bandwidth Stats ----
		function buildBandwidthStats(stats) {
			let total = stats.totalDataBytes || 1;
			let vPct = (stats.voucherDataBytes / total) * 100;
			let fPct = (stats.freeDataBytes / total) * 100;
			return E('div', { style: 'display: flex; flex-direction: column; gap: 8px;' }, [
				E('div', { style: 'display: flex; justify-content: space-between; font-size: 13px; color: #374151;' }, [
					E('span', {}, _('Bandwidth Usage')),
					E('span', {}, formatBytes(stats.totalDataBytes) + ' ' + _('Total Consumed'))
				]),
				E('div', { style: 'height: 24px; background: #e5e7eb; border-radius: 12px; overflow: hidden; display: flex;' }, [
					vPct > 0 ? E('div', {
						style: `height: 100%; width: ${vPct}%; background: #059669; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: 600; min-width: ${vPct > 5 ? '40' : '0'}px;`
					}, vPct > 5 ? Math.round(vPct) + '%' : '') : '',
					fPct > 0 ? E('div', {
						style: `height: 100%; width: ${fPct}%; background: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: 600; min-width: ${fPct > 5 ? '40' : '0'}px;`
					}, fPct > 5 ? Math.round(fPct) + '%' : '') : ''
				]),
				E('div', { style: 'display: flex; gap: 16px; font-size: 12px;' }, [
					E('span', {}, E('span', { style: 'display: inline-block; width: 10px; height: 10px; background: #059669; border-radius: 2px; margin-right: 4px;' }), 'Voucher: ', formatBytes(stats.voucherDataBytes)),
					E('span', {}, E('span', { style: 'display: inline-block; width: 10px; height: 10px; background: #7c3aed; border-radius: 2px; margin-right: 4px;' }), 'Free WiFi: ', formatBytes(stats.freeDataBytes))
				])
			]);
		}

		// ------------------ TAB 1: STATUS with Analytics Dashboard ------------------
		let stats = computeStats();
		let vSsid = uci.get('wireless', 'voucher5', 'ssid') || 'Voucher WiFi';
		let fSsid = uci.get('wireless', 'freewifi', 'ssid') || 'KAYLA INTERNET GRATIS';

		let tabStatus = E('div', { id: 'tab-status', class: 'voucher-tab-content', style: 'display: block; margin-top: 15px;' }, [
			// KPI Cards Grid
			E('div', { id: 'kpi-cards', style: 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;' },
				buildKpiCards(stats, vSsid, fSsid)
			),
			// Analytics Row: Session Ratio + Bandwidth
			E('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;' }, [
				E('div', { class: 'cbi-section', style: 'margin: 0;' }, [
					E('h3', { style: 'margin-top: 0;' }, _('session_ratio')),
					E('div', { class: 'cbi-section-node', id: 'session-ratio-bar' }, [buildRatioBar(stats)])
				]),
				E('div', { class: 'cbi-section', style: 'margin: 0;' }, [
					E('h3', { style: 'margin-top: 0;' }, _('Bandwidth Usage')),
					E('div', { class: 'cbi-section-node', id: 'bandwidth-stats' }, [buildBandwidthStats(stats)])
				])
			]),
			// Legacy Status Table
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('WiFi Portal Status')),
				E('div', { class: 'cbi-section-node' }, [
					E('table', { class: 'table' }, [
						E('tr', { class: 'tr' }, [
							E('td', { class: 'td', style: 'width: 30%; font-weight: bold;' }, _('Voucher WiFi SSID')),
							E('td', { class: 'td' }, uci.get('wireless', 'voucher5', 'ssid') || 'Voucher WiFi')
						]),
						E('tr', { class: 'tr' }, [
							E('td', { class: 'td', style: 'width: 30%; font-weight: bold;' }, _('Free WiFi SSID')),
							E('td', { class: 'td' }, uci.get('wireless', 'freewifi', 'ssid') || 'KAYLA INTERNET GRATIS')
						]),
						E('tr', { class: 'tr' }, [
							E('td', { class: 'td', style: 'width: 30%; font-weight: bold;' }, _('Available Vouchers')),
							E('td', { class: 'td' }, state.vouchers.data.length.toString())
						]),
						E('tr', { class: 'tr' }, [
							E('td', { class: 'td', style: 'width: 30%; font-weight: bold;' }, _('Active Voucher Sessions')),
							E('td', { class: 'td' }, state.voucherSessions.data.length.toString())
						]),
						E('tr', { class: 'tr' }, [
							E('td', { class: 'td', style: 'width: 30%; font-weight: bold;' }, _('Active Free WiFi Sessions')),
							E('td', { class: 'td' }, state.freeSessions.data.length.toString())
						]),
						E('tr', { class: 'tr' }, [
							E('td', { class: 'td', style: 'width: 30%; font-weight: bold;' }, _('Voucher Speed Limit')),
							E('td', { class: 'td' }, `${voucherCfg.VOUCHER_LIMIT_DOWN_MBPS || 0} Mbps Down / ${voucherCfg.VOUCHER_LIMIT_UP_MBPS || 0} Mbps Up`)
						]),
						E('tr', { class: 'tr' }, [
							E('td', { class: 'td', style: 'width: 30%; font-weight: bold;' }, _('Free WiFi Speed Limit')),
							E('td', { class: 'td' }, `${freeCfg.FREE_LIMIT_DOWN_MBPS || 0} Mbps Down / ${freeCfg.FREE_LIMIT_UP_MBPS || 0} Mbps Up`)
						])
					])
				]),
				E('div', { style: 'margin-top: 15px; display: flex; gap: 10px;' }, [
					E('button', {
						class: 'cbi-button cbi-button-action',
						click: function() {
							ui.showModal(_('Reloading services...'), [E('p', { class: 'spinning' }, _('Reapplying firewall rules and traffic shaping.'))]);
							fs.exec('/usr/sbin/voucherctl', ['init'])
								.then(() => fs.exec('/usr/sbin/freewifi', ['init']))
								.then(() => fs.exec('/etc/init.d/uhttpd', ['restart']))
								.then(() => {
									ui.hideModal();
									ui.addNotification(null, E('p', {}, _('Services reloaded successfully!')), 'info');
								});
						}
					}, _('Restart Services & Apply Rules')),
					E('button', {
						class: 'cbi-button cbi-button-neutral',
						click: function(ev) {
							ev.target.disabled = true;
							refreshData().finally(() => {
								ev.target.disabled = false;
								ui.addNotification(null, E('p', {}, _('Status refreshed successfully.')), 'info');
							});
						}
					}, _('Refresh'))
				])
			])
		]);

		// ------------------ TAB 2: VOUCHERS ------------------
		// Form Generate
		let formGenerate = E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('Generate Vouchers (Bulk)')),
			E('div', { class: 'cbi-section-node' }, [
				E('div', { class: 'cbi-value' }, [
					E('label', { class: 'cbi-value-title' }, _('Voucher Count')),
					E('div', { class: 'cbi-value-field' }, E('input', { type: 'number', id: 'bulk-count', class: 'cbi-input-text', value: '10', min: '1' }))
				]),
				E('div', { class: 'cbi-value' }, [
					E('label', { class: 'cbi-value-title' }, _('Duration (Minutes)')),
					E('div', { class: 'cbi-value-field' }, E('input', { type: 'number', id: 'bulk-minutes', class: 'cbi-input-text', value: '1440', min: '1' }))
				]),
				E('div', { class: 'cbi-value' }, [
					E('label', { class: 'cbi-value-title' }, _('Max Devices')),
					E('div', { class: 'cbi-value-field' }, E('input', { type: 'number', id: 'bulk-max', class: 'cbi-input-text', value: '1', min: '1' }))
				]),
				E('div', { class: 'cbi-value' }, [
					E('label', { class: 'cbi-value-title' }, _('Max Quota (MB)')),
					E('div', { class: 'cbi-value-field' }, [
						E('input', { type: 'number', id: 'bulk-quota', class: 'cbi-input-text', value: '0', min: '0' }),
						E('span', { style: 'font-size: 11px; color: #6b7280; margin-left: 4px;' }, '(0 = ' + _('quota_unlimited') + ')')
					])
				]),
				E('div', { class: 'cbi-value' }, [
					E('label', { class: 'cbi-value-title' }, _('Note')),
					E('div', { class: 'cbi-value-field' }, E('input', { type: 'text', id: 'bulk-note', class: 'cbi-input-text', value: 'Voucher WiFi' }))
				]),
				E('div', { class: 'cbi-value' }, [
					E('button', {
						class: 'cbi-button cbi-button-action important',
						click: function() {
							let count = document.getElementById('bulk-count').value || 10;
							let mins = document.getElementById('bulk-minutes').value || 1440;
							let max = document.getElementById('bulk-max').value || 1;
							let quota = document.getElementById('bulk-quota').value || 0;
							let note = document.getElementById('bulk-note').value || 'Bulk';
							ui.showModal(_('Generating Vouchers...'), [E('p', { class: 'spinning' }, _('Generating random bulk voucher codes.'))]);
							fs.exec('/usr/sbin/voucherctl', ['generate', count, mins, max, note, quota])
								.then(() => fs.read('/etc/voucher/vouchers'))
								.then(txt => {
									ui.hideModal();
									allVouchers = parseVouchers(txt);
									state.vouchers.data = allVouchers;
									state.vouchers.page = 1;
									renderVouchersTable();
									// Update KPI cards
									refreshData().catch(() => {});
									ui.addNotification(null, E('p', {}, _('Bulk vouchers generated successfully!')), 'info');
								});
						}
					}, _('Generate Bulk Vouchers'))
				])
			])
		]);

		// Table Vouchers Container
		let tableVouchersContainer = E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('WiFi Vouchers List')),
			E('div', { class: 'cbi-section-node' }, [
				E('div', { style: 'margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;' }, [
					E('div', {}, [
						E('span', {}, _('Search: ')),
						E('input', {
							type: 'text',
							id: 'voucher-search-box',
							class: 'cbi-input-text',
							placeholder: _('Search code / notes...'),
							style: 'width: 200px; display: inline-block;',
							keyup: function(ev) {
								state.vouchers.search = ev.target.value.toLowerCase();
								state.vouchers.page = 1;
								filterVouchers();
							}
						})
					]),
					E('button', {
						class: 'cbi-button cbi-button-remove',
						click: function() {
							if (confirm(_('Are you sure you want to delete all WiFi vouchers?'))) {
								ui.showModal(_('Clearing Vouchers...'), [E('p', { class: 'spinning' }, _('Deleting all voucher codes.'))]);
								fs.write('/etc/voucher/vouchers', '')
									.then(() => {
										ui.hideModal();
										allVouchers = [];
										state.vouchers.data = [];
										state.vouchers.page = 1;
										renderVouchersTable();
										refreshData().catch(() => {});
										ui.addNotification(null, E('p', {}, _('All vouchers have been deleted.')), 'info');
									});
							}
						}
					}, _('Delete All Vouchers'))
				]),
				E('table', { class: 'table', id: 'vouchers-table' }, [
					E('tr', { class: 'tr table-titles' }, [
						E('th', { class: 'th' }, _('Voucher Code')),
						E('th', { class: 'th' }, _('Duration')),
						E('th', { class: 'th' }, _('Max Devices')),
						E('th', { class: 'th' }, _('Max Quota (MB)')),
						E('th', { class: 'th' }, _('Note')),
						E('th', { class: 'th' }, _('Status')),
						E('th', { class: 'th' }, _('Action'))
					])
				]),
				E('div', { id: 'voucher-pager', style: 'margin-top: 10px; display: flex; justify-content: space-between; align-items: center;' })
			])
		]);

		function filterVouchers() {
			let query = state.vouchers.search.trim();
			if (!query) {
				state.vouchers.data = allVouchers;
			} else {
				state.vouchers.data = allVouchers.filter(v => {
					return v.code.toLowerCase().includes(query) || (v.note && v.note.toLowerCase().includes(query));
				});
			}
			renderVouchersTable();
		}

		function renderVouchersTable() {
			let tbl = tableVouchersContainer.querySelector('#vouchers-table');
			// Remove all rows except title row
			tbl.querySelectorAll('tr:not(.table-titles)').forEach(el => el.remove());

			let startIndex = (state.vouchers.page - 1) * state.vouchers.limit;
			let endIndex = startIndex + state.vouchers.limit;
			let pageData = state.vouchers.data.slice(startIndex, endIndex);

			if (pageData.length === 0) {
				tbl.appendChild(E('tr', { class: 'tr' }, [
					E('td', { class: 'td', colspan: 7, style: 'text-align: center; font-style: italic; color: #999;' }, _('No vouchers found'))
				]));
			} else {
				pageData.forEach(v => {
					let quotaDisplay = parseInt(v.quota_mb) > 0 ? v.quota_mb + ' MB' : _('quota_unlimited');
					tbl.appendChild(E('tr', { class: 'tr' }, [
						E('td', { class: 'td', style: 'font-weight: bold; font-family: monospace; font-size: 1.1em;' }, v.code),
						E('td', { class: 'td' }, `${v.minutes} Min`),
						E('td', { class: 'td' }, `${v.max_devices} Dev`),
						E('td', { class: 'td' }, quotaDisplay),
						E('td', { class: 'td' }, v.note || '-'),
						E('td', { class: 'td' }, v.status === 'used' ? E('span', { style: 'color: green; font-weight: bold;' }, _('Used') + ' (' + formatDate(v.used_at) + ')') : E('span', { style: 'color: blue;' }, _('New'))),
						E('td', { class: 'td' }, E('button', {
							class: 'cbi-button cbi-button-remove',
							click: function() {
								if (confirm(_('Delete voucher %s?').replace('%s', v.code))) {
									ui.showModal(_('Deleting Voucher...'), [E('p', { class: 'spinning' }, _('Deleting voucher.'))]);
									fs.exec('/usr/sbin/voucherctl', ['del', v.code])
										.then(() => fs.read('/etc/voucher/vouchers'))
										.then(txt => {
											ui.hideModal();
											allVouchers = parseVouchers(txt);
											state.vouchers.data = allVouchers;
											filterVouchers();
											refreshData().catch(() => {});
											ui.addNotification(null, E('p', {}, _('Voucher %s deleted successfully.').replace('%s', v.code)), 'info');
										});
								}
							}
						}, _('Delete')))
					]));
				});
			}

			// Render pager
			let pager = tableVouchersContainer.querySelector('#voucher-pager');
			pager.innerHTML = '';
			let totalPages = Math.ceil(state.vouchers.data.length / state.vouchers.limit) || 1;

			pager.appendChild(E('button', {
				class: 'cbi-button cbi-button-neutral',
				disabled: state.vouchers.page <= 1 ? true : null,
				click: function() {
					state.vouchers.page--;
					renderVouchersTable();
				}
			}, _('Previous')));

			pager.appendChild(E('span', {}, _('Page %s of %s (Total: %s)').replace('%s', state.vouchers.page).replace('%s', totalPages).replace('%s', state.vouchers.data.length)));

			pager.appendChild(E('button', {
				class: 'cbi-button cbi-button-neutral',
				disabled: state.vouchers.page >= totalPages ? true : null,
				click: function() {
					state.vouchers.page++;
					renderVouchersTable();
				}
			}, _('Next')));
		}

		renderVouchersTable();

		let tabVouchers = E('div', { id: 'tab-vouchers', class: 'voucher-tab-content', style: 'display:none; margin-top:15px;' }, [
			formGenerate,
			tableVouchersContainer
		]);

		// ------------------ TAB 3: SESSIONS ------------------
		// Voucher Sessions
		let tblVoucherSessions = E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('Active Voucher Sessions')),
			E('div', { class: 'cbi-section-node' }, [
				E('div', { style: 'margin-bottom: 10px;' }, [
					E('span', {}, _('Search: ')),
					E('input', {
						type: 'text',
						class: 'cbi-input-text',
						placeholder: _('Search IP / MAC / Voucher...'),
						style: 'width: 200px; display: inline-block;',
						keyup: function(ev) {
							state.voucherSessions.search = ev.target.value.toLowerCase();
							state.voucherSessions.page = 1;
							filterVoucherSessions();
						}
					})
				]),
				E('table', { class: 'table', id: 'voucher-sessions-table' }, [
					E('tr', { class: 'tr table-titles' }, [
						E('th', { class: 'th' }, _('Voucher Code')),
						E('th', { class: 'th' }, _('IP Address')),
						E('th', { class: 'th' }, _('MAC Address')),
						E('th', { class: 'th' }, _('Remaining Time')),
						E('th', { class: 'th' }, _('Data Usage')),
						E('th', { class: 'th' }, _('Action'))
					])
				]),
				E('div', { id: 'voucher-session-pager', style: 'margin-top: 10px; display: flex; justify-content: space-between; align-items: center;' })
			])
		]);

		function filterVoucherSessions() {
			let query = state.voucherSessions.search.trim();
			if (!query) {
				state.voucherSessions.data = allVoucherSessions;
			} else {
				state.voucherSessions.data = allVoucherSessions.filter(s => {
					return s.code.toLowerCase().includes(query) || s.ip.toLowerCase().includes(query) || s.mac.toLowerCase().includes(query);
				});
			}
			renderVoucherSessionsTable();
		}

		function renderVoucherSessionsTable() {
			let tbl = tblVoucherSessions.querySelector('#voucher-sessions-table');
			tbl.querySelectorAll('tr:not(.table-titles)').forEach(el => el.remove());

			let startIndex = (state.voucherSessions.page - 1) * state.voucherSessions.limit;
			let endIndex = startIndex + state.voucherSessions.limit;
			let pageData = state.voucherSessions.data.slice(startIndex, endIndex);

			if (pageData.length === 0) {
				tbl.appendChild(E('tr', { class: 'tr' }, [
					E('td', { class: 'td', colspan: 6, style: 'text-align: center; font-style: italic; color: #999;' }, _('No active voucher sessions'))
				]));
			} else {
				pageData.forEach(s => {
					tbl.appendChild(E('tr', { class: 'tr' }, [
						E('td', { class: 'td', style: 'font-weight: bold; font-family: monospace;' }, s.code),
						E('td', { class: 'td' }, s.ip),
						E('td', { class: 'td', style: 'font-family: monospace;' }, s.mac),
						E('td', { class: 'td' }, formatRemaining(s.expiry)),
						E('td', { class: 'td' }, dataUsageBar(s.used_bytes, s.max_quota_mb)),
						E('td', { class: 'td' }, E('button', {
							class: 'cbi-button cbi-button-remove',
							click: function() {
								if (confirm(_('Disconnect client %s (%s)?').replace('%s', s.ip).replace('%s', s.mac))) {
									ui.showModal(_('Disconnecting Client...'), [E('p', { class: 'spinning' }, _('Removing session and clearing firewall rules.'))]);
									fs.exec('/usr/sbin/voucherctl', ['kill', s.code, s.ip, s.mac])
										.then(() => L.resolveDefault(fs.read('/etc/voucher/sessions'), ''))
										.then(txt => {
											ui.hideModal();
											allVoucherSessions = parseVoucherSessions(txt);
											state.voucherSessions.data = allVoucherSessions;
											filterVoucherSessions();
											refreshData().catch(() => {});
											ui.addNotification(null, E('p', {}, _('Client %s disconnected.').replace('%s', s.ip)), 'info');
										})
										.catch(err => {
											ui.hideModal();
											ui.addNotification(null, E('p', {}, _('Failed to disconnect client: %s').replace('%s', err.message || err)), 'danger');
										});
								}
							}
						}, _('Disconnect')))
					]));
				});
			}

			let pager = tblVoucherSessions.querySelector('#voucher-session-pager');
			pager.innerHTML = '';
			let totalPages = Math.ceil(state.voucherSessions.data.length / state.voucherSessions.limit) || 1;

			pager.appendChild(E('button', {
				class: 'cbi-button cbi-button-neutral',
				disabled: state.voucherSessions.page <= 1 ? true : null,
				click: function() {
					state.voucherSessions.page--;
					renderVoucherSessionsTable();
				}
			}, _('Previous')));

			pager.appendChild(E('span', {}, _('Page %s of %s (Total: %s)').replace('%s', state.voucherSessions.page).replace('%s', totalPages).replace('%s', state.voucherSessions.data.length)));

			pager.appendChild(E('button', {
				class: 'cbi-button cbi-button-neutral',
				disabled: state.voucherSessions.page >= totalPages ? true : null,
				click: function() {
					state.voucherSessions.page++;
					renderVoucherSessionsTable();
				}
			}, _('Next')));
		}

		renderVoucherSessionsTable();

		// Free WiFi Sessions
		let tblFreeSessions = E('div', { class: 'cbi-section' }, [
			E('h3', {}, _('Active Free WiFi Sessions')),
			E('div', { class: 'cbi-section-node' }, [
				E('div', { style: 'margin-bottom: 10px;' }, [
					E('span', {}, _('Search: ')),
					E('input', {
						type: 'text',
						class: 'cbi-input-text',
						placeholder: _('Search Name / Phone / IP...'),
						style: 'width: 200px; display: inline-block;',
						keyup: function(ev) {
							state.freeSessions.search = ev.target.value.toLowerCase();
							state.freeSessions.page = 1;
							filterFreeSessions();
						}
					})
				]),
				E('table', { class: 'table', id: 'free-sessions-table' }, [
					E('tr', { class: 'tr table-titles' }, [
						E('th', { class: 'th' }, _('Name')),
						E('th', { class: 'th' }, _('Phone Number')),
						E('th', { class: 'th' }, _('IP Address')),
						E('th', { class: 'th' }, _('MAC Address')),
						E('th', { class: 'th' }, _('Remaining Time')),
						E('th', { class: 'th' }, _('Data Usage')),
						E('th', { class: 'th' }, _('Action'))
					])
				]),
				E('div', { id: 'free-session-pager', style: 'margin-top: 10px; display: flex; justify-content: space-between; align-items: center;' })
			])
		]);

		function filterFreeSessions() {
			let query = state.freeSessions.search.trim();
			if (!query) {
				state.freeSessions.data = allFreeSessions;
			} else {
				state.freeSessions.data = allFreeSessions.filter(s => {
					return s.name.toLowerCase().includes(query) || s.phone.includes(query) || s.ip.toLowerCase().includes(query);
				});
			}
			renderFreeSessionsTable();
		}

		function renderFreeSessionsTable() {
			let tbl = tblFreeSessions.querySelector('#free-sessions-table');
			tbl.querySelectorAll('tr:not(.table-titles)').forEach(el => el.remove());

			let startIndex = (state.freeSessions.page - 1) * state.freeSessions.limit;
			let endIndex = startIndex + state.freeSessions.limit;
			let pageData = state.freeSessions.data.slice(startIndex, endIndex);

			if (pageData.length === 0) {
				tbl.appendChild(E('tr', { class: 'tr' }, [
					E('td', { class: 'td', colspan: 7, style: 'text-align: center; font-style: italic; color: #999;' }, _('No active Free WiFi sessions'))
				]));
			} else {
				pageData.forEach(s => {
					tbl.appendChild(E('tr', { class: 'tr' }, [
						E('td', { class: 'td', style: 'font-weight: bold;' }, s.name),
						E('td', { class: 'td' }, s.phone),
						E('td', { class: 'td' }, s.ip),
						E('td', { class: 'td', style: 'font-family: monospace;' }, s.mac),
						E('td', { class: 'td' }, formatRemaining(s.expiry)),
						E('td', { class: 'td' }, dataUsageBar(s.used_bytes, s.max_quota_mb)),
						E('td', { class: 'td' }, E('button', {
							class: 'cbi-button cbi-button-remove',
							click: function() {
								if (confirm(_('Disconnect Free WiFi user %s?').replace('%s', s.name))) {
									ui.showModal(_('Disconnecting Client...'), [E('p', { class: 'spinning' }, _('Removing session and clearing firewall rules.'))]);
									fs.exec('/usr/sbin/freewifi', ['kill', s.ip, s.mac])
										.then(() => L.resolveDefault(fs.read('/etc/freewifi/sessions'), ''))
										.then(txt => {
											ui.hideModal();
											allFreeSessions = parseFreeSessions(txt);
											state.freeSessions.data = allFreeSessions;
											filterFreeSessions();
											refreshData().catch(() => {});
											ui.addNotification(null, E('p', {}, _('Client %s disconnected.').replace('%s', s.name)), 'info');
										})
										.catch(err => {
											ui.hideModal();
											ui.addNotification(null, E('p', {}, _('Failed to disconnect client: %s').replace('%s', err.message || err)), 'danger');
										});
								}
							}
						}, _('Disconnect')))
					]));
				});
			}

			let pager = tblFreeSessions.querySelector('#free-session-pager');
			pager.innerHTML = '';
			let totalPages = Math.ceil(state.freeSessions.data.length / state.freeSessions.limit) || 1;

			pager.appendChild(E('button', {
				class: 'cbi-button cbi-button-neutral',
				disabled: state.freeSessions.page <= 1 ? true : null,
				click: function() {
					state.freeSessions.page--;
					renderFreeSessionsTable();
				}
			}, _('Previous')));

			pager.appendChild(E('span', {}, _('Page %s of %s (Total: %s)').replace('%s', state.freeSessions.page).replace('%s', totalPages).replace('%s', state.freeSessions.data.length)));

			pager.appendChild(E('button', {
				class: 'cbi-button cbi-button-neutral',
				disabled: state.freeSessions.page >= totalPages ? true : null,
				click: function() {
					state.freeSessions.page++;
					renderFreeSessionsTable();
				}
			}, _('Next')));
		}

		renderFreeSessionsTable();

		let tabSessions = E('div', { id: 'tab-sessions', class: 'voucher-tab-content', style: 'display:none; margin-top:15px;' }, [
			E('div', { style: 'margin-bottom: 15px; text-align: right;' }, [
				E('button', {
					class: 'cbi-button cbi-button-neutral',
					click: function(ev) {
						ev.target.disabled = true;
						refreshData().finally(() => {
							ev.target.disabled = false;
							ui.addNotification(null, E('p', {}, _('Active sessions refreshed successfully.')), 'info');
						});
					}
				}, _('Refresh Sessions'))
			]),
			tblVoucherSessions,
			tblFreeSessions
		]);

		// ------------------ TAB 4: SETTINGS ------------------
		let tabSettings = E('div', { id: 'tab-settings', class: 'voucher-tab-content', style: 'display:none; margin-top:15px;' }, [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('SSID & Network Configuration')),
				E('div', { class: 'cbi-section-node' }, [
					E('div', { class: 'cbi-section-descr' }, _('SSID and wireless settings are saved to the UCI system configuration.')),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Voucher WiFi SSID')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'set-voucher-ssid',
							class: 'cbi-input-text',
							value: uci.get('wireless', 'voucher5', 'ssid') || ''
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Free Internet SSID')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'set-free-ssid',
							class: 'cbi-input-text',
							value: uci.get('wireless', 'freewifi', 'ssid') || ''
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('AP Isolation')),
						E('div', { class: 'cbi-value-field' }, [
							E('label', { style: 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;' }, [
								E('input', { type: 'checkbox', id: 'set-voucher-isolate', checked: uci.get('wireless', 'voucher5', 'isolate') === '1' ? true : null }),
								E('span', {}, _('Enable AP Isolation for Voucher WiFi'))
							]),
							E('label', { style: 'display: flex; align-items: center; gap: 6px;' }, [
								E('input', { type: 'checkbox', id: 'set-free-isolate', checked: uci.get('wireless', 'freewifi', 'isolate') === '1' ? true : null }),
								E('span', {}, _('Enable AP Isolation for Free WiFi'))
							]),
							E('span', { style: 'font-size: 11px; color: #6b7280; margin-top: 4px; display: block;' }, _('Disconnects WiFi briefly when toggled.'))
						])
					])
				])
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Speed Limits & Duration')),
				E('div', { class: 'cbi-section-node' }, [
					E('div', { class: 'cbi-section-descr' }, _('Configure speed limits in flat Mbps and the active session duration for Free WiFi.')),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Voucher Download Speed Limit (Mbps)')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'number',
							id: 'set-voucher-down',
							class: 'cbi-input-text',
							value: voucherCfg.VOUCHER_LIMIT_DOWN_MBPS || '0',
							min: '0'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Voucher Upload Speed Limit (Mbps)')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'number',
							id: 'set-voucher-up',
							class: 'cbi-input-text',
							value: voucherCfg.VOUCHER_LIMIT_UP_MBPS || '0',
							min: '0'
						}))
					]),
					E('hr', { style: 'border: 0; border-top: 1px dashed #ccc; margin: 20px 15px;' }),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Free WiFi Download Speed Limit (Mbps)')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'number',
							id: 'set-free-down',
							class: 'cbi-input-text',
							value: freeCfg.FREE_LIMIT_DOWN_MBPS || '0',
							min: '0'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Free WiFi Upload Speed Limit (Mbps)')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'number',
							id: 'set-free-up',
							class: 'cbi-input-text',
							value: freeCfg.FREE_LIMIT_UP_MBPS || '0',
							min: '0'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Free WiFi Session Duration (Minutes)')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'number',
							id: 'set-free-duration',
							class: 'cbi-input-text',
							value: freeCfg.FREE_SESSION_MINUTES || '1440',
							min: '1'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Free WiFi Max Quota (MB)')),
						E('div', { class: 'cbi-value-field' }, [
							E('input', {
								type: 'number',
								id: 'set-free-quota',
								class: 'cbi-input-text',
								value: freeCfg.FREE_LIMIT_QUOTA_MB || '0',
								min: '0'
							}),
							E('span', { style: 'font-size: 11px; color: #6b7280; margin-left: 4px;' }, '(' + _('Set to 0 for unlimited data.') + ')')
						])
					])
				])
			]),
			E('div', { class: 'cbi-value' }, [
				E('button', {
					class: 'cbi-button cbi-button-save important',
					click: function() {
						let voucherSsid = document.getElementById('set-voucher-ssid').value;
						let freeSsid = document.getElementById('set-free-ssid').value;
						let vDown = document.getElementById('set-voucher-down').value || 0;
						let vUp = document.getElementById('set-voucher-up').value || 0;
						let fDown = document.getElementById('set-free-down').value || 0;
						let fUp = document.getElementById('set-free-up').value || 0;
						let fDur = document.getElementById('set-free-duration').value || 1440;
						let fQuota = document.getElementById('set-free-quota').value || 0;
						let vIsolate = document.getElementById('set-voucher-isolate').checked ? '1' : '0';
						let fIsolate = document.getElementById('set-free-isolate').checked ? '1' : '0';

						ui.showModal(_('Saving Settings...'), [E('p', { class: 'spinning' }, _('Saving to wireless UCI and writing controller configuration files.'))]);

						// Save UCI wireless config
						if (voucherSsid) uci.set('wireless', 'voucher5', 'ssid', voucherSsid);
						if (freeSsid) uci.set('wireless', 'freewifi', 'ssid', freeSsid);
						uci.set('wireless', 'voucher5', 'isolate', vIsolate);
						uci.set('wireless', 'freewifi', 'isolate', fIsolate);

						// Save config files
						voucherCfg.VOUCHER_LIMIT_DOWN_MBPS = vDown;
						voucherCfg.VOUCHER_LIMIT_UP_MBPS = vUp;

						freeCfg.FREE_LIMIT_DOWN_MBPS = fDown;
						freeCfg.FREE_LIMIT_UP_MBPS = fUp;
						freeCfg.FREE_SESSION_MINUTES = fDur;
						freeCfg.FREE_LIMIT_QUOTA_MB = fQuota;

						let serialize = function(cfg) {
							let out = '';
							for (let k in cfg) {
								out += `${k}='${cfg[k]}'\n`;
							}
							return out;
						};

						uci.save()
							.then(() => uciCommit('wireless'))
							.then(() => fs.write('/etc/voucher/config', serialize(voucherCfg)))
							.then(() => fs.write('/etc/freewifi/config', serialize(freeCfg)))
							.then(() => fs.exec('/usr/sbin/voucherctl', ['speed', vDown, vUp]))
							.then(() => fs.exec('/usr/sbin/freewifi', ['speed', fDown, fUp]))
							.then(() => fs.exec('/sbin/wifi', ['reload']))
							.then(() => {
								ui.hideModal();
								// Update local views
								refreshData().catch(() => {});
								ui.addNotification(null, E('p', {}, _('Settings saved successfully!')), 'info');
							})
							.catch(err => {
								ui.hideModal();
								ui.addNotification(null, E('p', {}, _('Failed to save settings: %s').replace('%s', err.message)), 'danger');
							});
					}
				}, _('Save & Apply'))
			])
		]);

		// ------------------ TAB 5: PORTAL CUSTOMIZER ------------------
		let tabPortal = E('div', { id: 'tab-portal', class: 'voucher-tab-content', style: 'display:none; margin-top:15px;' }, [
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Voucher WiFi Portal Design')),
				E('div', { class: 'cbi-section-node' }, [
					E('div', { class: 'cbi-section-descr' }, _('Customize the texts, colors, and styles of the Voucher WiFi landing page.')),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Portal Title')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-voucher-title',
							class: 'cbi-input-text',
							value: voucherCfg.VOUCHER_TITLE || 'WiFi Voucher Murah'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Portal Description')),
						E('div', { class: 'cbi-value-field' }, E('textarea', {
							id: 'portal-voucher-desc',
							class: 'cbi-input-textarea',
							rows: 3,
							style: 'width:100%;'
						}, [ voucherCfg.VOUCHER_DESC || '' ]))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Footer / Instructions Note')),
						E('div', { class: 'cbi-value-field' }, E('textarea', {
							id: 'portal-voucher-footer',
							class: 'cbi-input-textarea',
							rows: 2,
							style: 'width:100%;'
						}, [ voucherCfg.VOUCHER_FOOTER || '' ]))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Login Button Text')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-voucher-button',
							class: 'cbi-input-text',
							value: voucherCfg.VOUCHER_BUTTON_TEXT || 'Masuk'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Background Color')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-voucher-bg-color',
							class: 'cbi-input-text',
							placeholder: '#f5f7fb',
							value: voucherCfg.VOUCHER_BG_COLOR || '#f5f7fb'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Background Gradient (CSS)')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-voucher-bg-gradient',
							class: 'cbi-input-text',
							placeholder: 'linear-gradient(135deg, #f5f7fb 0%, #e2e8f0 100%)',
							value: voucherCfg.VOUCHER_BG_GRADIENT || ''
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Font Color')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-voucher-font-color',
							class: 'cbi-input-text',
							placeholder: '#111827',
							value: voucherCfg.VOUCHER_FONT_COLOR || '#111827'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Accent / Button Color')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-voucher-accent-color',
							class: 'cbi-input-text',
							placeholder: '#0f766e',
							value: voucherCfg.VOUCHER_ACCENT_COLOR || '#0f766e'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Custom CSS (Override)')),
						E('div', { class: 'cbi-value-field' }, E('textarea', {
							id: 'portal-voucher-css',
							class: 'cbi-input-textarea',
							rows: 6,
							style: 'width:100%; font-family:monospace; font-size:12px;'
						}, [ (voucherCfg.VOUCHER_CUSTOM_CSS || '').replace(/__NL__/g, '\n') ]))
					])
				])
			]),
			E('div', { class: 'cbi-section' }, [
				E('h3', {}, _('Free WiFi Portal Design')),
				E('div', { class: 'cbi-section-node' }, [
					E('div', { class: 'cbi-section-descr' }, _('Customize the texts, colors, and styles of the Free WiFi landing page.')),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Portal Title')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-free-title',
							class: 'cbi-input-text',
							value: freeCfg.FREE_TITLE || 'KAYLA INTERNET GRATIS!'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Portal Description')),
						E('div', { class: 'cbi-value-field' }, E('textarea', {
							id: 'portal-free-desc',
							class: 'cbi-input-textarea',
							rows: 3,
							style: 'width:100%;'
						}, [ freeCfg.FREE_DESC || '' ]))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Login Button Text')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-free-button',
							class: 'cbi-input-text',
							value: freeCfg.FREE_BUTTON_TEXT || 'Konek Internet'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Background Color')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-free-bg-color',
							class: 'cbi-input-text',
							placeholder: '#f5f7fb',
							value: freeCfg.FREE_BG_COLOR || '#f5f7fb'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Background Gradient (CSS)')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-free-bg-gradient',
							class: 'cbi-input-text',
							placeholder: 'linear-gradient(135deg, #f5f7fb 0%, #e2e8f0 100%)',
							value: freeCfg.FREE_BG_GRADIENT || ''
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Font Color')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-free-font-color',
							class: 'cbi-input-text',
							placeholder: '#111827',
							value: freeCfg.FREE_FONT_COLOR || '#111827'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Accent / Button Color')),
						E('div', { class: 'cbi-value-field' }, E('input', {
							type: 'text',
							id: 'portal-free-accent-color',
							class: 'cbi-input-text',
							placeholder: '#0f766e',
							value: freeCfg.FREE_ACCENT_COLOR || '#0f766e'
						}))
					]),
					E('div', { class: 'cbi-value' }, [
						E('label', { class: 'cbi-value-title' }, _('Custom CSS (Override)')),
						E('div', { class: 'cbi-value-field' }, E('textarea', {
							id: 'portal-free-css',
							class: 'cbi-input-textarea',
							rows: 6,
							style: 'width:100%; font-family:monospace; font-size:12px;'
						}, [ (freeCfg.FREE_CUSTOM_CSS || '').replace(/__NL__/g, '\n') ]))
					])
				])
			]),
			E('div', { class: 'cbi-value' }, [
				E('button', {
					class: 'cbi-button cbi-button-save important',
					click: function() {
						let vTitle = document.getElementById('portal-voucher-title').value;
						let vDesc = document.getElementById('portal-voucher-desc').value;
						let vFooter = document.getElementById('portal-voucher-footer').value;
						let vButton = document.getElementById('portal-voucher-button').value;
						let vBg = document.getElementById('portal-voucher-bg-color').value;
						let vGrad = document.getElementById('portal-voucher-bg-gradient').value;
						let vFont = document.getElementById('portal-voucher-font-color').value;
						let vAccent = document.getElementById('portal-voucher-accent-color').value;
						let vCss = document.getElementById('portal-voucher-css').value.replace(/\n/g, '__NL__');

						let fTitle = document.getElementById('portal-free-title').value;
						let fDesc = document.getElementById('portal-free-desc').value;
						let fButton = document.getElementById('portal-free-button').value;
						let fBg = document.getElementById('portal-free-bg-color').value;
						let fGrad = document.getElementById('portal-free-bg-gradient').value;
						let fFont = document.getElementById('portal-free-font-color').value;
						let fAccent = document.getElementById('portal-free-accent-color').value;
						let fCss = document.getElementById('portal-free-css').value.replace(/\n/g, '__NL__');

						ui.showModal(_('Saving Settings...'), [E('p', { class: 'spinning' }, _('Saving to wireless UCI and writing controller configuration files.'))]);

						voucherCfg.VOUCHER_TITLE = vTitle;
						voucherCfg.VOUCHER_DESC = vDesc;
						voucherCfg.VOUCHER_FOOTER = vFooter;
						voucherCfg.VOUCHER_BUTTON_TEXT = vButton;
						voucherCfg.VOUCHER_BG_COLOR = vBg;
						voucherCfg.VOUCHER_BG_GRADIENT = vGrad;
						voucherCfg.VOUCHER_FONT_COLOR = vFont;
						voucherCfg.VOUCHER_ACCENT_COLOR = vAccent;
						voucherCfg.VOUCHER_CUSTOM_CSS = vCss;

						freeCfg.FREE_TITLE = fTitle;
						freeCfg.FREE_DESC = fDesc;
						freeCfg.FREE_BUTTON_TEXT = fButton;
						freeCfg.FREE_BG_COLOR = fBg;
						freeCfg.FREE_BG_GRADIENT = fGrad;
						freeCfg.FREE_FONT_COLOR = fFont;
						freeCfg.FREE_ACCENT_COLOR = fAccent;
						freeCfg.FREE_CUSTOM_CSS = fCss;

						let serialize = function(cfg) {
							let out = '';
							for (let k in cfg) {
								let val = (cfg[k] || '').toString().replace(/'/g, "'\\''");
								out += `${k}='${val}'\n`;
							}
							return out;
						};

						fs.write('/etc/voucher/config', serialize(voucherCfg))
							.then(() => fs.write('/etc/freewifi/config', serialize(freeCfg)))
							.then(() => {
								ui.hideModal();
								ui.addNotification(null, E('p', {}, _('Settings saved successfully!')), 'info');
							})
							.catch(err => {
								ui.hideModal();
								ui.addNotification(null, E('p', {}, _('Failed to save settings: %s').replace('%s', err.message)), 'danger');
							});
					}
				}, _('Save & Apply'))
			])
		]);

		container.appendChild(tabStatus);
		container.appendChild(tabVouchers);
		container.appendChild(tabSessions);
		container.appendChild(tabSettings);
		container.appendChild(tabPortal);

		return container;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
