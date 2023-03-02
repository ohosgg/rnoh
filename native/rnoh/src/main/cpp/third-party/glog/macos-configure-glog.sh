#!/bin/bash

touch $2

cd $1

# Manually disable gflags include to fix issue https://github.com/facebook/react-native/issues/28446
sed -i '' 's/\@ac_cv_have_libgflags\@/0/' src/glog/logging.h.in
sed -i '' 's/HAVE_LIB_GFLAGS/HAVE_LIB_GFLAGS_DISABLED/' src/config.h.in

./configure --host arm-apple-darwin

cat << EOF >> src/config.h
/* Add in so we have Apple Target Conditionals */
#ifdef __APPLE__
#include <TargetConditionals.h>
#include <Availability.h>
#endif

/* Special configuration for ucontext */
#undef HAVE_UCONTEXT_H
#undef PC_FROM_UCONTEXT
#if defined(__x86_64__)
#define PC_FROM_UCONTEXT uc_mcontext->__ss.__rip
#elif defined(__i386__)
#define PC_FROM_UCONTEXT uc_mcontext->__ss.__eip
#endif
EOF
