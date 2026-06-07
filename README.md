# luci-app-voucher

A lightweight, modern voucher-based captive portal management system for OpenWrt/ImmortalWrt, integrated directly into the LuCI web interface.

![luci-app-voucher](assets/preview.png)

Built using stock OpenWrt components:
- **LuCI** (JavaScript-based view for administration)
- **uHTTPd** (to serve the portal pages and CGI handlers)
- **nftables / fw4** (for rules and session timeouts)
- **dnsmasq / unbound** (for DHCP and DNS redirection)
- **tc (Traffic Control)** (for speed limiting/shaping)

## Features

- **Integrated LuCI Interface**: Manage vouchers, active sessions, and speed limits directly from the OpenWrt LuCI dashboard under **Services** -> **Voucher WiFi**.
- **Dual Portal Network Support**:
  - **Voucher WiFi**: Intercepts guest traffic and requires a valid voucher code to grant access.
  - **Free WiFi**: Intercepts guest traffic and requires only a Name and Phone Number (for logging) to grant 24-hour access.
- **Dynamic Speed Limiting**: Restrict voucher network download/upload speeds dynamically as a percentage of the total configured bandwidth.
- **Reliable Captive Portal Detection (Android/iOS)**:
  - Disables IPv6 DHCP and Router Advertisements (RA) on guest interfaces to prevent IPv6 bypass.
  - Configures explicit DHCP Gateway (Option 3) and DNS (Option 6) to force mobile devices to trigger their native "Sign in to network" pop-ups.
- **Automatic Expiry**: Active sessions expire automatically using nftables timeouts, backed by a minute-interval cron job that safely disconnects associated WiFi stations.

## Folder Layout

- `openwrt-files/` - Contains the files that will be installed on the router:
  - `usr/share/luci/menu.d/` & `usr/share/rpcd/acl.d/` - LuCI menu and ACL definitions.
  - `www/luci-static/resources/view/voucher/admin.js` - The modern LuCI web administration view.
  - `www/cgi-bin/` - CGI scripts for processing voucher validation and admin actions.
  - `usr/sbin/voucherctl` & `usr/sbin/freewifi` - Backend control utilities.
  - `etc/nftables.d/` - Custom nftables rule templates (`90-voucher.nft` and `91-freewifi.nft`).
- `scripts/install.sh` - Development script to quickly sync files to a target router over SSH.
- `build_ipk.sh` - Packaging script to build the `.ipk` package.

## Installation

### Method 1: Using the IPK Package (Recommended)

1. Download the latest `luci-app-voucher_1.0.0-1_all.ipk` (you can download the artifact built automatically by GitHub Actions).
2. Transfer the `.ipk` file to your OpenWrt router (e.g., using `scp`).
3. Install the package using `opkg`:
   ```sh
   opkg update
   opkg install /path/to/luci-app-voucher_1.0.0-1_all.ipk
   ```

### Method 2: Building from Source

To build the package yourself on your local machine:
1. Clone this repository.
2. Run the build script:
   ```sh
   ./build_ipk.sh
   ```
3. This will generate `luci-app-voucher_1.0.0-1_all.ipk` in the root directory.

## Administration

Once installed, log into your OpenWrt LuCI interface and navigate to:
**Services** -> **Voucher WiFi**

Here, you can:
- Generate voucher codes with custom durations (days/hours/minutes).
- Monitor active sessions (including IP, MAC, and remaining time).
- Delete unused vouchers or manually disconnect active sessions (*Kill*).
- Configure speed limits for guest networks.
