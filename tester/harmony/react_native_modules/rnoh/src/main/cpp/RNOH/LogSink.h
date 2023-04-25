#pragma once

#include <glog/logging.h>

class LogSink : public google::LogSink {
public:
    static void initializeLogging();
    
    void send(google::LogSeverity severity, const char* full_filename,
                    const char* base_filename, int line,
                    const struct ::tm* tm_time,
                    const char* message, size_t message_len) override;

private:
    static LogSink *instance;
};