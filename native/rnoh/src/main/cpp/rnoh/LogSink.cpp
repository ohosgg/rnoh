#include <hilog/log.h>
#include "rnoh/LogSink.h"

using namespace google;

RNOHLogSink *RNOHLogSink::instance = nullptr;

void RNOHLogSink::initializeLogging() {
    if (!instance) {
        instance = new RNOHLogSink();
        google::AddLogSink(instance);
        FLAGS_logtostderr = true;
        google::InitGoogleLogging("[RNOH]");
    }
}

void RNOHLogSink::send(
    google::LogSeverity severity,
    const char *full_filename,
    const char *base_filename,
    int line,
    const ::tm *tm_time,
    const char *message,
    size_t message_len) {
    std::ostringstream stream;
    stream  << "[RNOH] "
            << "<" << base_filename << ':' << line << "> "
            << std::string(message, message_len);
    auto messageString = stream.str();
    auto c_str = messageString.c_str();

    switch (severity) {
        case GLOG_INFO:
            OH_LOG_INFO(LOG_APP, "%{public}s", c_str);
            break;
        case GLOG_WARNING:
            OH_LOG_WARN(LOG_APP, "%{public}s", c_str);
            break;
        case GLOG_ERROR:
            OH_LOG_ERROR(LOG_APP, "%{public}s", c_str);
            break;
        case GLOG_FATAL:
            OH_LOG_FATAL(LOG_APP, "%{public}s", c_str);
            break;
        default:
            OH_LOG_WARN(LOG_APP, "%{public}s", c_str);
            break;
    }
}