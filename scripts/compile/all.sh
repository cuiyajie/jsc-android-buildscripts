#!/bin/bash -e

SCRIPT_DIR=$(cd `dirname $0`; pwd)
export ANDROID_API=21

compile_arch() {
  echo -e '\033]2;'"compiling toolchain for $JSC_ARCH $FLAVOR"'\007'
  printf "\n\n\n\t\t=================== compiling toolchain for $JSC_ARCH $FLAVOR ===================\n\n\n"
  $SCRIPT_DIR/toolchain.sh
  echo -e '\033]2;'"compiling icu for $JSC_ARCH $FLAVOR"'\007'
  printf "\n\n\n\t\t=================== compiling icu for $JSC_ARCH $FLAVOR ===================\n\n\n"
  $SCRIPT_DIR/icu.sh
  echo -e '\033]2;'"compiling jsc for $JSC_ARCH $FLAVOR"'\007'
  printf "\n\n\n\t\t=================== compiling jsc for $JSC_ARCH $FLAVOR ===================n\n\n"
  $SCRIPT_DIR/jsc.sh
}

compile() {
  for arch in arm x86
  do
    export JSC_ARCH=$arch
    export ENABLE_COMPAT=1
    compile_arch
  done

  for arch in arm64 x86_64
  do
    export JSC_ARCH=$arch
    export ENABLE_COMPAT=0
    compile_arch
  done
}

if ${I18N}
then
  export FLAVOR=intl
  export ENABLE_INTL=1
  compile
else
  export FLAVOR=no-intl
  export ENABLE_INTL=0
  compile
fi
