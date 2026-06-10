#!/bin/sh
set -eu

TARGET="${1:-}"
[ -n "$TARGET" ] || {
	echo "Usage: $0 root@OPENWRT_IP"
	echo
	echo "Optional environment:"
	echo "  VOUCHER_WIFI_IFACE=voucher5"
	echo "  VOUCHER_RADIO=radio0"
	echo "  VOUCHER_IF=phy0-ap1"
	echo "  UPLINK_IF=br-lan"
	echo "  VOUCHER_SSID='Voucher WiFi'"
	echo "  VOUCHER_CHANNEL=149"
	echo "  VOUCHER_HTMODE=VHT80"
	echo "  VOUCHER_COUNTRY=ID"
	echo "  VOUCHER_NET=10.18.20.0/24"
	echo "  VOUCHER_NET_IP=10.18.20.1"
	echo "  VOUCHER_NETMASK=255.255.255.0"
	echo "  VOUCHER_DHCP_START=100"
	echo "  VOUCHER_DHCP_LIMIT=150"
	echo "  VOUCHER_DHCP_LEASE=2h"
	echo "  VOUCHER_PORT=2080"
	exit 1
}

SSH_OPTS="-o BatchMode=yes -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
FILES="$ROOT_DIR/openwrt-files"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$ROOT_DIR/backups/$STAMP"

VOUCHER_WIFI_IFACE="${VOUCHER_WIFI_IFACE:-voucher5}"
VOUCHER_RADIO="${VOUCHER_RADIO:-radio0}"
VOUCHER_IF="${VOUCHER_IF:-phy0-ap1}"
UPLINK_IF="${UPLINK_IF:-br-lan}"
VOUCHER_SSID="${VOUCHER_SSID:-Voucher WiFi}"
VOUCHER_CHANNEL="${VOUCHER_CHANNEL:-149}"
VOUCHER_HTMODE="${VOUCHER_HTMODE:-VHT80}"
VOUCHER_COUNTRY="${VOUCHER_COUNTRY:-ID}"
VOUCHER_NET="${VOUCHER_NET:-10.18.20.0/24}"
VOUCHER_NET_IP="${VOUCHER_NET_IP:-10.18.20.1}"
VOUCHER_NETMASK="${VOUCHER_NETMASK:-255.255.255.0}"
VOUCHER_DHCP_START="${VOUCHER_DHCP_START:-100}"
VOUCHER_DHCP_LIMIT="${VOUCHER_DHCP_LIMIT:-150}"
VOUCHER_DHCP_LEASE="${VOUCHER_DHCP_LEASE:-2h}"
VOUCHER_PORT="${VOUCHER_PORT:-2080}"

FREE_WIFI_IFACE="${FREE_WIFI_IFACE:-freewifi}"
FREE_RADIO="${FREE_RADIO:-radio0}"
FREE_IF="${FREE_IF:-phy0-ap2}"
FREE_SSID="${FREE_SSID:-KAYLA INTERNET GRATIS}"
FREE_NET="${FREE_NET:-10.18.30.0/24}"
FREE_NET_IP="${FREE_NET_IP:-10.18.30.1}"
FREE_NETMASK="${FREE_NETMASK:-255.255.255.0}"
FREE_DHCP_START="${FREE_DHCP_START:-100}"
FREE_DHCP_LIMIT="${FREE_DHCP_LIMIT:-100}"
FREE_DHCP_LEASE="${FREE_DHCP_LEASE:-2h}"
FREE_PORT="${FREE_PORT:-2081}"
FREE_SESSION_MINUTES="${FREE_SESSION_MINUTES:-1440}"
VOUCHER_LIMIT_DOWN_MBPS="${VOUCHER_LIMIT_DOWN_MBPS:-0}"
VOUCHER_LIMIT_UP_MBPS="${VOUCHER_LIMIT_UP_MBPS:-0}"
FREE_LIMIT_DOWN_MBPS="${FREE_LIMIT_DOWN_MBPS:-5}"
FREE_LIMIT_UP_MBPS="${FREE_LIMIT_UP_MBPS:-1}"
FREE_LIMIT_QUOTA_MB="${FREE_LIMIT_QUOTA_MB:-0}"

mkdir -p "$BACKUP_DIR"

echo "Checking router access..."
ssh $SSH_OPTS "$TARGET" 'command -v uci >/dev/null && command -v fw4 >/dev/null && command -v nft >/dev/null && command -v uhttpd >/dev/null'

echo "Ensuring minimal traffic-control packages..."
ssh $SSH_OPTS "$TARGET" '
if ! command -v tc >/dev/null 2>&1; then
	if command -v opkg >/dev/null 2>&1; then
		opkg update
		opkg install tc-tiny kmod-sched-core kmod-sched-act-police
	else
		echo "Warning: opkg not found. Skipping traffic control packages installation."
	fi
fi
'

echo "Backing up current router config to $BACKUP_DIR ..."
ssh $SSH_OPTS "$TARGET" 'tar czf - /etc/config/network /etc/config/wireless /etc/config/dhcp /etc/config/firewall /etc/nftables.d /etc/voucher /etc/freewifi 2>/dev/null || true' > "$BACKUP_DIR/openwrt-pre-voucher.tar.gz"

echo "Copying voucher files..."
ssh $SSH_OPTS "$TARGET" 'rm -rf /tmp/voucher-install && mkdir -p /tmp/voucher-install'
tar cf - -C "$FILES" . | ssh $SSH_OPTS "$TARGET" 'tar xf - -C /tmp/voucher-install'

cat > "$ROOT_DIR/install-remote.sh" <<EOF
set -eu
mkdir -p /etc/voucher /etc/freewifi /www/voucher/cgi-bin /www/freewifi/cgi-bin /www/cgi-bin
mkdir -p /etc/nftables.d
mkdir -p /usr/share/luci/menu.d
mkdir -p /usr/share/rpcd/acl.d
mkdir -p /www/luci-static/resources/view/voucher
mkdir -p /etc/hotplug.d/iface

cp /tmp/voucher-install/usr/sbin/voucherctl /usr/sbin/voucherctl
cp /tmp/voucher-install/usr/sbin/freewifi /usr/sbin/freewifi

cp /tmp/voucher-install/www/cgi-bin/voucher /www/cgi-bin/voucher
cp /tmp/voucher-install/www/cgi-bin/freewifi /www/cgi-bin/freewifi
cp /tmp/voucher-install/www/cgi-bin/voucher-admin /www/cgi-bin/voucher-admin

cp /tmp/voucher-install/www/voucher/cgi-bin/voucher /www/voucher/cgi-bin/voucher
cp /tmp/voucher-install/www/voucher/index.html /www/voucher/index.html

cp /tmp/voucher-install/www/freewifi/cgi-bin/freewifi /www/freewifi/cgi-bin/freewifi
cp /tmp/voucher-install/www/freewifi/index.html /www/freewifi/index.html

cp /tmp/voucher-install/etc/init.d/voucher /etc/init.d/voucher
cp /tmp/voucher-install/etc/init.d/freewifi /etc/init.d/freewifi

cp /tmp/voucher-install/etc/nftables.d/90-voucher.nft /etc/nftables.d/90-voucher.nft
cp /tmp/voucher-install/etc/nftables.d/91-freewifi.nft /etc/nftables.d/91-freewifi.nft

cp /tmp/voucher-install/etc/hotplug.d/iface/99-voucher-tc /etc/hotplug.d/iface/99-voucher-tc

cp /tmp/voucher-install/usr/share/luci/menu.d/luci-app-voucher.json /usr/share/luci/menu.d/luci-app-voucher.json
cp /tmp/voucher-install/usr/share/rpcd/acl.d/luci-app-voucher.json /usr/share/rpcd/acl.d/luci-app-voucher.json
cp /tmp/voucher-install/www/luci-static/resources/view/voucher/admin.js /www/luci-static/resources/view/voucher/admin.js

cat > /etc/voucher/config <<'EOFCFG'
VOUCHER_NET='$VOUCHER_NET'
VOUCHER_IP='$VOUCHER_NET_IP'
VOUCHER_PORT='$VOUCHER_PORT'
VOUCHER_IF='$VOUCHER_IF'
UPLINK_IF='$UPLINK_IF'
VOUCHER_LIMIT_DOWN_MBPS='$VOUCHER_LIMIT_DOWN_MBPS'
VOUCHER_LIMIT_UP_MBPS='$VOUCHER_LIMIT_UP_MBPS'
VOUCHER_TITLE='WiFi Voucher Murah'
VOUCHER_DESC='Masukkan kode voucher untuk mengaktifkan akses internet perangkat ini.'
VOUCHER_FOOTER='Hubungi admin untuk mendapatkan kode voucher wifi.'
VOUCHER_BUTTON_TEXT='Masuk'
VOUCHER_BG_COLOR='#f5f7fb'
VOUCHER_BG_GRADIENT='linear-gradient(135deg, #f5f7fb 0%, #e2e8f0 100%)'
VOUCHER_FONT_COLOR='#111827'
VOUCHER_ACCENT_COLOR='#0f766e'
VOUCHER_CUSTOM_CSS=''
EOFCFG

cat > /etc/freewifi/config <<'EOFFREE'
FREE_NET='$FREE_NET'
FREE_IP='$FREE_NET_IP'
FREE_PORT='$FREE_PORT'
FREE_IF='$FREE_IF'
UPLINK_IF='$UPLINK_IF'
FREE_SESSION_MINUTES='$FREE_SESSION_MINUTES'
FREE_LIMIT_DOWN_MBPS='$FREE_LIMIT_DOWN_MBPS'
FREE_LIMIT_UP_MBPS='$FREE_LIMIT_UP_MBPS'
FREE_LIMIT_QUOTA_MB='0'
FREE_TITLE='KAYLA INTERNET GRATIS!'
FREE_DESC='Isi nama dan nomor telpon untuk menggunakan internet gratis.'
FREE_BUTTON_TEXT='Konek Internet'
FREE_BG_COLOR='#f5f7fb'
FREE_BG_GRADIENT='linear-gradient(135deg, #f5f7fb 0%, #e2e8f0 100%)'
FREE_FONT_COLOR='#111827'
FREE_ACCENT_COLOR='#0f766e'
FREE_CUSTOM_CSS=''
EOFFREE

if [ ! -s /etc/voucher/vouchers ]; then
	cp /tmp/voucher-install/etc/voucher/vouchers /etc/voucher/vouchers
fi
: > /etc/voucher/sessions
: > /etc/freewifi/sessions

if [ ! -s /etc/voucher/admin_token ]; then
	tr -dc 'A-Z0-9' < /dev/urandom | dd bs=1 count=12 of=/etc/voucher/admin_token 2>/dev/null
	echo >> /etc/voucher/admin_token
fi
if [ ! -s /etc/voucher/admin_csrf ]; then
	tr -dc 'A-Z0-9' < /dev/urandom | dd bs=1 count=16 of=/etc/voucher/admin_csrf 2>/dev/null
	echo >> /etc/voucher/admin_csrf
fi

chmod 755 /usr/sbin/voucherctl /usr/sbin/freewifi /www/cgi-bin/voucher /www/cgi-bin/freewifi /www/cgi-bin/voucher-admin /www/voucher/cgi-bin/voucher /www/freewifi/cgi-bin/freewifi /etc/init.d/voucher /etc/init.d/freewifi /etc/hotplug.d/iface/99-voucher-tc
chmod 644 /www/voucher/index.html /www/freewifi/index.html /usr/share/luci/menu.d/luci-app-voucher.json /usr/share/rpcd/acl.d/luci-app-voucher.json /www/luci-static/resources/view/voucher/admin.js
chmod 600 /etc/voucher/vouchers /etc/voucher/sessions /etc/voucher/admin_token /etc/voucher/admin_csrf /etc/freewifi/config /etc/freewifi/sessions

uci -q delete network.voucher || true
uci set network.voucher=interface
uci set network.voucher.proto=static
uci set network.voucher.ipaddr='$VOUCHER_NET_IP'
uci set network.voucher.netmask='$VOUCHER_NETMASK'
uci set network.voucher.ipv6=0

uci -q delete network.freewifi || true
uci set network.freewifi=interface
uci set network.freewifi.proto=static
uci set network.freewifi.ipaddr='$FREE_NET_IP'
uci set network.freewifi.netmask='$FREE_NETMASK'
uci set network.freewifi.ipv6=0

uci -q delete dhcp.voucher || true
uci set dhcp.voucher=dhcp
uci set dhcp.voucher.interface=voucher
uci set dhcp.voucher.start='$VOUCHER_DHCP_START'
uci set dhcp.voucher.limit='$VOUCHER_DHCP_LIMIT'
uci set dhcp.voucher.leasetime='$VOUCHER_DHCP_LEASE'
uci set dhcp.voucher.dhcpv4=server
uci set dhcp.voucher.dhcpv6=disabled
uci set dhcp.voucher.ra=disabled
uci add_list dhcp.voucher.dhcp_option='3,$VOUCHER_NET_IP'
uci add_list dhcp.voucher.dhcp_option='6,$VOUCHER_NET_IP'

uci -q delete dhcp.freewifi || true
uci set dhcp.freewifi=dhcp
uci set dhcp.freewifi.interface=freewifi
uci set dhcp.freewifi.start='$FREE_DHCP_START'
uci set dhcp.freewifi.limit='$FREE_DHCP_LIMIT'
uci set dhcp.freewifi.leasetime='$FREE_DHCP_LEASE'
uci set dhcp.freewifi.dhcpv4=server
uci set dhcp.freewifi.dhcpv6=disabled
uci set dhcp.freewifi.ra=disabled
uci add_list dhcp.freewifi.dhcp_option='3,$FREE_NET_IP'
uci add_list dhcp.freewifi.dhcp_option='6,$FREE_NET_IP'

uci -q set dhcp.odhcpd.maindhcp=0 || true
uci -q set dhcp.odhcpx.maindhcp=0 || true

# Handle Unbound port 53 conflicts
if command -v unbound >/dev/null 2>&1; then
	uci set dhcp.@dnsmasq[0].port='0'
fi

uci -q delete wireless.$VOUCHER_WIFI_IFACE || true
uci set wireless.$VOUCHER_WIFI_IFACE=wifi-iface
uci set wireless.$VOUCHER_WIFI_IFACE.device='$VOUCHER_RADIO'
uci set wireless.$VOUCHER_WIFI_IFACE.mode=ap
uci set wireless.$VOUCHER_WIFI_IFACE.ssid='$VOUCHER_SSID'
uci set wireless.$VOUCHER_WIFI_IFACE.encryption=none
uci set wireless.$VOUCHER_WIFI_IFACE.network=voucher
uci set wireless.$VOUCHER_WIFI_IFACE.isolate=1

uci -q delete wireless.$FREE_WIFI_IFACE || true
uci set wireless.$FREE_WIFI_IFACE=wifi-iface
uci set wireless.$FREE_WIFI_IFACE.device='$FREE_RADIO'
uci set wireless.$FREE_WIFI_IFACE.mode=ap
uci set wireless.$FREE_WIFI_IFACE.ssid='$FREE_SSID'
uci set wireless.$FREE_WIFI_IFACE.encryption=none
uci set wireless.$FREE_WIFI_IFACE.network=freewifi
uci set wireless.$FREE_WIFI_IFACE.isolate=1

uci set wireless.$VOUCHER_RADIO.channel='$VOUCHER_CHANNEL'
uci set wireless.$VOUCHER_RADIO.htmode='$VOUCHER_HTMODE'
uci set wireless.$VOUCHER_RADIO.country='$VOUCHER_COUNTRY'

uci -q delete firewall.voucher || true
uci set firewall.voucher=zone
uci set firewall.voucher.name=voucher
uci set firewall.voucher.network=voucher
uci set firewall.voucher.input=REJECT
uci set firewall.voucher.output=ACCEPT
uci set firewall.voucher.forward=REJECT

uci -q delete firewall.freewifi || true
uci set firewall.freewifi=zone
uci set firewall.freewifi.name=freewifi
uci set firewall.freewifi.network=freewifi
uci set firewall.freewifi.input=REJECT
uci set firewall.freewifi.output=ACCEPT
uci set firewall.freewifi.forward=REJECT

uci -q delete firewall.voucher_to_lan || true
uci set firewall.voucher_to_lan=forwarding
uci set firewall.voucher_to_lan.src=voucher
uci set firewall.voucher_to_lan.dest=lan

uci -q delete firewall.freewifi_to_lan || true
uci set firewall.freewifi_to_lan=forwarding
uci set firewall.freewifi_to_lan.src=freewifi
uci set firewall.freewifi_to_lan.dest=lan

uci -q delete firewall.allow_voucher_dhcp || true
uci set firewall.allow_voucher_dhcp=rule
uci set firewall.allow_voucher_dhcp.name='Allow-Voucher-DHCP'
uci set firewall.allow_voucher_dhcp.src=voucher
uci set firewall.allow_voucher_dhcp.proto=udp
uci set firewall.allow_voucher_dhcp.dest_port=67
uci set firewall.allow_voucher_dhcp.target=ACCEPT
uci set firewall.allow_voucher_dhcp.family=ipv4

uci -q delete firewall.allow_freewifi_dhcp || true
uci set firewall.allow_freewifi_dhcp=rule
uci set firewall.allow_freewifi_dhcp.name='Allow-FreeWiFi-DHCP'
uci set firewall.allow_freewifi_dhcp.src=freewifi
uci set firewall.allow_freewifi_dhcp.proto=udp
uci set firewall.allow_freewifi_dhcp.dest_port=67
uci set firewall.allow_freewifi_dhcp.target=ACCEPT
uci set firewall.allow_freewifi_dhcp.family=ipv4

uci -q delete firewall.allow_voucher_dns || true
uci set firewall.allow_voucher_dns=rule
uci set firewall.allow_voucher_dns.name='Allow-Voucher-DNS'
uci add_list firewall.allow_voucher_dns.proto=tcp
uci add_list firewall.allow_voucher_dns.proto=udp
uci set firewall.allow_voucher_dns.src=voucher
uci set firewall.allow_voucher_dns.dest_port=53
uci set firewall.allow_voucher_dns.target=ACCEPT

uci -q delete firewall.allow_freewifi_dns || true
uci set firewall.allow_freewifi_dns=rule
uci set firewall.allow_freewifi_dns.name='Allow-FreeWiFi-DNS'
uci add_list firewall.allow_freewifi_dns.proto=tcp
uci add_list firewall.allow_freewifi_dns.proto=udp
uci set firewall.allow_freewifi_dns.src=freewifi
uci set firewall.allow_freewifi_dns.dest_port=53
uci set firewall.allow_freewifi_dns.target=ACCEPT

uci -q delete firewall.allow_voucher_portal || true
uci set firewall.allow_voucher_portal=rule
uci set firewall.allow_voucher_portal.name='Allow-Voucher-Portal'
uci set firewall.allow_voucher_portal.src=voucher
uci set firewall.allow_voucher_portal.proto=tcp
uci set firewall.allow_voucher_portal.dest_port='$VOUCHER_PORT'
uci set firewall.allow_voucher_portal.target=ACCEPT

uci -q delete firewall.allow_freewifi_portal || true
uci set firewall.allow_freewifi_portal=rule
uci set firewall.allow_freewifi_portal.name='Allow-FreeWiFi-Portal'
uci set firewall.allow_freewifi_portal.src=freewifi
uci set firewall.allow_freewifi_portal.proto=tcp
uci set firewall.allow_freewifi_portal.dest_port='$FREE_PORT'
uci set firewall.allow_freewifi_portal.target=ACCEPT

uci set firewall.@defaults[0].flow_offloading=0
uci set firewall.@defaults[0].flow_offloading_hw=0

uci commit network
uci commit dhcp
uci commit wireless
uci commit firewall

/usr/sbin/voucherctl init
/usr/sbin/freewifi init
fw4 check
/etc/init.d/voucher enable
/etc/init.d/freewifi enable
/etc/init.d/network reload
wifi reload
/etc/init.d/dnsmasq restart
/etc/init.d/firewall restart
/etc/init.d/voucher restart
/etc/init.d/freewifi restart
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart

mkdir -p /etc/crontabs
( grep -v '/usr/sbin/voucherctl cleanup' /etc/crontabs/root 2>/dev/null | grep -v '/usr/sbin/freewifi cleanup' || true; echo '* * * * * /usr/sbin/voucherctl cleanup'; echo '* * * * * /usr/sbin/freewifi cleanup' ) > /etc/crontabs/root.tmp
mv /etc/crontabs/root.tmp /etc/crontabs/root
chmod 600 /etc/crontabs/root
/etc/init.d/cron enable 2>/dev/null || true
/etc/init.d/cron restart 2>/dev/null || true
rm -rf /tmp/voucher-install
df -h /overlay
rm -f /tmp/install-remote.sh
EOF

# Copy the generated script to the router via stdin redirect
ssh $SSH_OPTS "$TARGET" "cat > /tmp/install-remote.sh" < "$ROOT_DIR/install-remote.sh"
rm -f "$ROOT_DIR/install-remote.sh"

# Run it asynchronously in the background on the router so it survives network/Wi-Fi reload drops!
echo "Running installation on the router in the background..."
ssh $SSH_OPTS "$TARGET" "sh /tmp/install-remote.sh >/tmp/install-remote.log 2>&1 &"

echo "Installed. Test by joining SSID: $VOUCHER_SSID"
