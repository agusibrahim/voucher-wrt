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
			'Saving Settings...': 'Menyimpan Pengaturan...',
			'Saving to wireless UCI and writing controller configuration files.': 'Menyimpan ke UCI nirkabel dan menulis konfigurasi controller.',
			'Settings saved successfully!': 'Pengaturan berhasil disimpan!',
			'Failed to save settings: %s': 'Gagal menyimpan pengaturan: %s',
			'Save & Apply': 'Simpan & Terapkan',
			'Expired': 'Expired',
			'Voucher %s deleted successfully.': 'Voucher %s berhasil dihapus.',
			'Disconnect Free WiFi user %s?': 'Putuskan koneksi Free WiFi %s?',
			'Client %s disconnected.': 'Koneksi %s berhasil diputuskan.',
			'Search:': 'Cari:'
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

		// Parse Vouchers
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
						used_at: p[7] || ''
					});
				}
			});
			// Since newest vouchers are appended to the end, reverse list to show newest first
			list.reverse();
			return list;
		};

		// Parse Voucher Sessions
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
						max_devices: p[4] || '1',
						note: p[5] || ''
					});
				}
			});
			return list;
		};

		// Parse Free WiFi Sessions
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
						expiry: p[5] || '0'
					});
				}
			});
			return list;
		};

		let allVouchers = parseVouchers(vouchersTxt);
		let allVoucherSessions = parseVoucherSessions(voucherSessionsTxt);
		let allFreeSessions = parseFreeSessions(freeSessionsTxt);

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
			E('li', { class: 'cbi-tab cbi-tab-disabled', 'data-tab': 'settings', click: switchTab }, E('a', {}, _('Network & Speed Settings')))
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

				// Update Status tab UI elements
				tabStatus.querySelector('tr:nth-child(1) td:nth-child(2)').textContent = uci.get('wireless', 'voucher5', 'ssid') || 'Voucher WiFi';
				tabStatus.querySelector('tr:nth-child(2) td:nth-child(2)').textContent = uci.get('wireless', 'freewifi', 'ssid') || 'KAYLA INTERNET GRATIS';
				tabStatus.querySelector('tr:nth-child(3) td:nth-child(2)').textContent = allVouchers.length.toString();
				tabStatus.querySelector('tr:nth-child(4) td:nth-child(2)').textContent = allVoucherSessions.length.toString();
				tabStatus.querySelector('tr:nth-child(5) td:nth-child(2)').textContent = allFreeSessions.length.toString();
			});
		}

		// ------------------ TAB 1: STATUS ------------------
		let tabStatus = E('div', { id: 'tab-status', class: 'voucher-tab-content', style: 'display: block; margin-top: 15px;' }, [
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
							let note = document.getElementById('bulk-note').value || 'Bulk';
							ui.showModal(_('Generating Vouchers...'), [E('p', { class: 'spinning' }, _('Generating random bulk voucher codes.'))]);
							fs.exec('/usr/sbin/voucherctl', ['generate', count, mins, max, note])
								.then(() => fs.read('/etc/voucher/vouchers'))
								.then(txt => {
									ui.hideModal();
									allVouchers = parseVouchers(txt);
									state.vouchers.data = allVouchers;
									state.vouchers.page = 1;
									renderVouchersTable();
									// Update Status Tab
									tabStatus.querySelector('tr:nth-child(3) td:nth-child(2)').textContent = allVouchers.length.toString();
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
										tabStatus.querySelector('tr:nth-child(3) td:nth-child(2)').textContent = '0';
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
					E('td', { class: 'td', colspan: 6, style: 'text-align: center; font-style: italic; color: #999;' }, _('No vouchers found'))
				]));
			} else {
				pageData.forEach(v => {
					tbl.appendChild(E('tr', { class: 'tr' }, [
						E('td', { class: 'td', style: 'font-weight: bold; font-family: monospace; font-size: 1.1em;' }, v.code),
						E('td', { class: 'td' }, `${v.minutes} Min`),
						E('td', { class: 'td' }, `${v.max_devices} Dev`),
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
											tabStatus.querySelector('tr:nth-child(3) td:nth-child(2)').textContent = allVouchers.length.toString();
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
						E('th', { class: 'th' }, _('Note')),
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
						E('td', { class: 'td' }, s.note || '-'),
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
											tabStatus.querySelector('tr:nth-child(4) td:nth-child(2)').textContent = allVoucherSessions.length.toString();
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
					E('td', { class: 'td', colspan: 6, style: 'text-align: center; font-style: italic; color: #999;' }, _('No active Free WiFi sessions'))
				]));
			} else {
				pageData.forEach(s => {
					tbl.appendChild(E('tr', { class: 'tr' }, [
						E('td', { class: 'td', style: 'font-weight: bold;' }, s.name),
						E('td', { class: 'td' }, s.phone),
						E('td', { class: 'td' }, s.ip),
						E('td', { class: 'td', style: 'font-family: monospace;' }, s.mac),
						E('td', { class: 'td' }, formatRemaining(s.expiry)),
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
											tabStatus.querySelector('tr:nth-child(5) td:nth-child(2)').textContent = allFreeSessions.length.toString();
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

						ui.showModal(_('Saving Settings...'), [E('p', { class: 'spinning' }, _('Saving to wireless UCI and writing controller configuration files.'))]);

						// Save UCI wireless config
						if (voucherSsid) uci.set('wireless', 'voucher5', 'ssid', voucherSsid);
						if (freeSsid) uci.set('wireless', 'freewifi', 'ssid', freeSsid);

						// Save config files
						voucherCfg.VOUCHER_LIMIT_DOWN_MBPS = vDown;
						voucherCfg.VOUCHER_LIMIT_UP_MBPS = vUp;

						freeCfg.FREE_LIMIT_DOWN_MBPS = fDown;
						freeCfg.FREE_LIMIT_UP_MBPS = fUp;
						freeCfg.FREE_SESSION_MINUTES = fDur;

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
								tabStatus.querySelector('tr:nth-child(1) td:nth-child(2)').textContent = voucherSsid;
								tabStatus.querySelector('tr:nth-child(2) td:nth-child(2)').textContent = freeSsid;
								tabStatus.querySelector('tr:nth-child(6) td:nth-child(2)').textContent = `${vDown} Mbps Down / ${vUp} Mbps Up`;
								tabStatus.querySelector('tr:nth-child(7) td:nth-child(2)').textContent = `${fDown} Mbps Down / ${fUp} Mbps Up`;
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

		return container;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
