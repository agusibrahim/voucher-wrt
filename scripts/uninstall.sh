#!/bin/sh
set -eu

TARGET="${1:-}"
[ -n "$TARGET" ] || {
	echo "Usage: $0 root@OPENWRT_IP"
	exit 1
}

ssh -o BatchMode=yes "$TARGET" '
set -eu
/etc/init.d/voucher stop 2>/dev/null || true
/etc/init.d/voucher disable 2>/dev/null || true
/etc/init.d/freewifi stop 2>/dev/null || true
/etc/init.d/freewifi disable 2>/dev/null || true

rm -f /etc/init.d/voucher /etc/init.d/freewifi /usr/sbin/voucherctl /usr/sbin/freewifi /etc/nftables.d/90-voucher.nft /etc/nftables.d/91-freewifi.nft
rm -f /usr/share/luci/menu.d/luci-app-voucher.json /usr/share/rpcd/acl.d/luci-app-voucher.json
rm -rf /www/luci-static/resources/view/voucher
rm -rf /www/voucher /www/freewifi
rm -f /www/cgi-bin/voucher /www/cgi-bin/freewifi /www/cgi-bin/voucher-admin
rm -rf /etc/voucher /etc/freewifi

uci -q delete network.voucher || true
uci -q delete network.freewifi || true
uci -q delete dhcp.voucher || true
uci -q delete dhcp.freewifi || true
uci -q delete wireless.voucher5 || true
uci -q delete wireless.freewifi || true
uci -q delete firewall.voucher || true
uci -q delete firewall.freewifi || true
uci -q delete firewall.voucher_to_lan || true
uci -q delete firewall.freewifi_to_lan || true
uci -q delete firewall.allow_voucher_dhcp || true
uci -q delete firewall.allow_freewifi_dhcp || true
uci -q delete firewall.allow_voucher_dns || true
uci -q delete firewall.allow_freewifi_dns || true
uci -q delete firewall.allow_voucher_portal || true
uci -q delete firewall.allow_freewifi_portal || true

uci commit network
uci commit dhcp
uci commit wireless
uci commit firewall

fw4 check
/etc/init.d/network reload
wifi reload
/etc/init.d/dnsmasq restart
/etc/init.d/firewall restart

mkdir -p /etc/crontabs
( grep -v '/usr/sbin/voucherctl cleanup' /etc/crontabs/root 2>/dev/null | grep -v '/usr/sbin/freewifi cleanup' || true ) > /etc/crontabs/root.tmp
mv /etc/crontabs/root.tmp /etc/crontabs/root
chmod 600 /etc/crontabs/root
/etc/init.d/cron restart 2>/dev/null || true
/etc/init.d/rpcd restart 2>/dev/null || true
/etc/init.d/uhttpd restart 2>/dev/null || true
'

echo "Voucher portal removed. Wireless SSID assignment is left for manual review."
