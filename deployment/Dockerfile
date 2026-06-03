# syntax=docker/dockerfile:1

FROM node:24-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /workspace
COPY backend/.mvn backend/.mvn
COPY backend/mvnw backend/pom.xml backend/
RUN chmod +x backend/mvnw
COPY backend/ backend/
COPY --from=frontend-build /workspace/frontend/dist/ backend/src/main/resources/META-INF/resources/
RUN cd backend && ./mvnw -B package -DskipTests

FROM registry.access.redhat.com/ubi9/openjdk-21-runtime:1.24
ENV LANGUAGE='en_US:en'

COPY --from=backend-build --chown=185 /workspace/backend/target/quarkus-app/lib/ /deployments/lib/
COPY --from=backend-build --chown=185 /workspace/backend/target/quarkus-app/*.jar /deployments/
COPY --from=backend-build --chown=185 /workspace/backend/target/quarkus-app/app/ /deployments/app/
COPY --from=backend-build --chown=185 /workspace/backend/target/quarkus-app/quarkus/ /deployments/quarkus/

EXPOSE 8080
USER 185
ENV JAVA_OPTS_APPEND="-Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT ["/opt/jboss/container/java/run/run-java.sh"]
