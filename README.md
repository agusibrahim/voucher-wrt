# OpenWrt Voucher Captive Portal

Lightweight voucher captive portal for OpenWrt/ImmortalWrt using only stock tools:
`uhttpd`, `uci`, `fw4`, `nft`, BusyBox shell, and `dnsmasq`.

No `opkg install` is required.

## Current Tested Router

- Device: Bolt BL201
- Firmware: ImmortalWrt 23.05.2
- Target: `ramips/mt7620`
- Admin IP used during setup: `192.168.18.20`
- Voucher SSID: `Voucher WiFi Kayla`
- Voucher subnet: `10.18.20.0/24`
- Portal listener: `10.18.20.1:2080`
- Free SSID: `KAYLA INTERNET GRATIS`
- Free subnet: `10.18.30.0/24`
- Free portal listener: `10.18.30.1:2081`
- Free speed limit: 10 percent of 45/10 Mbps, about 4.5/1 Mbps

## Folder Layout

- `openwrt-files/` - files copied to the router.
- `scripts/install.sh` - local installer for another OpenWrt router.
- `scripts/uninstall.sh` - removes the portal pieces and UCI sections.

The free WiFi portal is handled by `freewifi`, `freewifi.cgi`, and
`freewifi-init`. It asks for name and phone only, stores sessions in
`/etc/freewifi/sessions`, and appears in the same admin panel under
`Pengguna Internet Gratis`.

## Install To Another Router

Make sure SSH root access works first.

```sh
chmod +x scripts/install.sh scripts/uninstall.sh
./scripts/install.sh root@192.168.18.20
```

For another device, adjust at least the target IP. The tested router now runs
the voucher SSID on 5 GHz because its 2.4 GHz radio had a very weak link.

```sh
./scripts/install.sh root@192.168.1.1
```

`VOUCHER_WIFI_IFACE` is the UCI wireless section name, such as `wifinet0`.
`VOUCHER_IF` is the runtime Linux interface name used by nftables, such as
`phy0-ap1`. Check both on the target router after a first install:

```sh
ssh root@192.168.1.1 'uci show wireless; iw dev'
```

Optional parameters:

```sh
VOUCHER_WIFI_IFACE=voucher5
VOUCHER_RADIO=radio0
VOUCHER_IF=phy0-ap1
UPLINK_IF=br-lan
VOUCHER_SSID="Voucher WiFi"
VOUCHER_CHANNEL=36
VOUCHER_HTMODE=VHT80
VOUCHER_COUNTRY=ID
VOUCHER_NET=10.18.20.0/24
VOUCHER_NET_IP=10.18.20.1
VOUCHER_NETMASK=255.255.255.0
VOUCHER_DHCP_START=100
VOUCHER_DHCP_LIMIT=150
VOUCHER_DHCP_LEASE=2h
VOUCHER_PORT=2080
```

## Manage Vouchers

On the router:

```sh
/usr/sbin/voucherctl status
/usr/sbin/voucherctl add KODEBARU 1440 1 "1 hari"
/usr/sbin/voucherctl del KODEBARU
```

Admin panel:

```sh
ssh root@192.168.18.20 'cat /etc/voucher/admin_token'
```

Open from the admin WiFi/LAN:

```text
http://192.168.18.20/cgi-bin/voucher-admin?token=TOKEN
```

The admin page can generate vouchers, add manual vouchers, set duration in
days/hours/minutes, view active sessions, kill active users, and delete vouchers.
It can also limit voucher-network speed as a percentage of configured full
download/upload Mbps.

Admin actions use POST forms. Reloading the clean admin URL will not repeat
kill/delete/generate actions.

Vouchers are limited by `max device`. A voucher can be used once per unique
device until the configured device limit is reached. After the final allowed
device logs in, the voucher is removed from the voucher file, so later attempts
return `Kode voucher tidak dikenal`. Killing a user disconnects the active
session but does not make that voucher reusable.

Duration enforcement runs through nft timeouts plus a once-per-minute cleanup
cron job. The installer disables OpenWrt flow offloading so expired users cannot
continue through cached/offloaded connections. When a session expires, cleanup
removes the allow-list entry and disconnects the WiFi station when its MAC is
known.

Speed limiting requires `tc-tiny`, `kmod-sched-core`, and
`kmod-sched-act-police`. On the tested router these packages used little space
and left about 4.2 MB overlay free. Without `tc`, the admin setting is shown but
cannot enforce shaping.

Voucher file format:

```text
CODE|MINUTES|MAX_DEVICES|NOTE|STATUS|USED_IP|USED_MAC|USED_AT
```

Example:

```text
DJ3UU|1440|1|1 hari|new|||
```

## Captive Portal Detection (Android/iOS)

Modern mobile operating systems check for captive portals immediately after connecting to a Wi-Fi network. To ensure reliable pop-up detection, the system implements:
- **Disabling IPv6**: Modern mobile devices prioritize IPv6 internet checks. If the gateway doesn't intercept IPv6, the device might report "Connected, no internet" without prompting to sign in. The installer disables IPv6 DHCP and Router Advertisements (RA) on the voucher and free Wi-Fi networks to force mobile clients to use IPv4 only.
- **Explicit DHCP Options**: The DHCP server explicitly advertises the router interface IP (`10.18.20.1` / `10.18.30.1`) as both the Default Gateway (DHCP Option 3) and DNS Server (DHCP Option 6). This prevents devices from treating the network as "local only" and forces them to issue internet reachability checks which are then redirected to the login page.

## Security Notes

The tested router accepted SSH root login with a blank password. Set a root
password before exposing the router to users:

```sh
ssh root@192.168.18.20 passwd
```

## Restore

The installer stores a tar backup under `backups/<timestamp>/`.

To remove the portal config:

```sh
./scripts/uninstall.sh root@192.168.18.20
```
