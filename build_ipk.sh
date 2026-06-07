#!/bin/bash
set -e

# Disable Mac metadata files (._ files) in tar
export COPYFILE_DISABLE=1

# Config
PKG_NAME="luci-app-voucher"
PKG_VERSION="1.0.0"
PKG_RELEASE="1"
PKG_ARCH="all"

BUILD_DIR="ipk_build_temp"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/control"
mkdir -p "$BUILD_DIR/data"

# Copy package files to data directory
cp -r openwrt-files/* "$BUILD_DIR/data/"

# Create control file
cat << EOF > "$BUILD_DIR/control/control"
Package: $PKG_NAME
Version: $PKG_VERSION-$PKG_RELEASE
Section: luci
Architecture: $PKG_ARCH
Maintainer: Antigravity
Depends: luci-base, nftables
Description: LuCI app for Voucher WiFi and Free WiFi management.
EOF

# Create postinst script
cat << 'EOF' > "$BUILD_DIR/control/postinst"
#!/bin/sh
if [ -z "${IPKG_INSTROOT}" ]; then
    echo "Enabling and starting voucher services..."
    /etc/init.d/voucher enable
    /etc/init.d/freewifi enable
    /etc/init.d/voucher start
    /etc/init.d/freewifi start
    
    # Reload uhttpd and rpcd to apply new acl and menu
    /etc/init.d/rpcd restart
    /etc/init.d/uhttpd restart
fi
exit 0
EOF
chmod +x "$BUILD_DIR/control/postinst"

# Create prerm script
cat << 'EOF' > "$BUILD_DIR/control/prerm"
#!/bin/sh
if [ -z "${IPKG_INSTROOT}" ]; then
    echo "Stopping and disabling voucher services..."
    /etc/init.d/voucher stop
    /etc/init.d/freewifi stop
    /etc/init.d/voucher disable
    /etc/init.d/freewifi disable
fi
exit 0
EOF
chmod +x "$BUILD_DIR/control/prerm"

# Create postrm script
cat << 'EOF' > "$BUILD_DIR/control/postrm"
#!/bin/sh
if [ -z "${IPKG_INSTROOT}" ]; then
    echo "Restarting services to clean up LuCI..."
    /etc/init.d/rpcd restart
    /etc/init.d/uhttpd restart
fi
exit 0
EOF
chmod +x "$BUILD_DIR/control/postrm"

# Build control.tar.gz
cd "$BUILD_DIR/control"
tar --uname root --gname root --format=ustar --no-xattrs --no-mac-metadata -czf ../control.tar.gz .
cd ../../

# Build data.tar.gz
cd "$BUILD_DIR/data"
tar --uname root --gname root --format=ustar --no-xattrs --no-mac-metadata -czf ../data.tar.gz .
cd ../../

# Create debian-binary
echo "2.0" > "$BUILD_DIR/debian-binary"

# Archive into .ipk file (using tar.gz packaging for maximum portability on macOS/OpenWrt)
cd "$BUILD_DIR"
tar --uname root --gname root --format=ustar --no-xattrs --no-mac-metadata -czf "../${PKG_NAME}_${PKG_VERSION}-${PKG_RELEASE}_${PKG_ARCH}.ipk" control.tar.gz data.tar.gz debian-binary
cd ../

# Clean up
rm -rf "$BUILD_DIR"

echo "Package successfully built: ${PKG_NAME}_${PKG_VERSION}-${PKG_RELEASE}_${PKG_ARCH}.ipk"
