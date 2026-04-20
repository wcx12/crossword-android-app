#!/bin/bash
# Gradle wrapper script for Unix

APP_BASE_NAME=$(basename "$0")
APP_HOME=$(cd "$(dirname "$0")" && pwd)

DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'

JAVACMD=${JAVA_HOME}/bin/java

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar

exec "$JAVACMD" $DEFAULT_JVM_OPTS $JAVA_OPTS \
    -classpath "$CLASSPATH" \
    org.gradle.wrapper.GradleWrapperMain "$@"
