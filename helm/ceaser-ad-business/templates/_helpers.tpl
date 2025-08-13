{{/*
Expand the name of the chart.
*/}}
{{- define "ceaser-ad-business.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "ceaser-ad-business.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "ceaser-ad-business.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "ceaser-ad-business.labels" -}}
helm.sh/chart: {{ include "ceaser-ad-business.chart" . }}
{{ include "ceaser-ad-business.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ceaser-ad-business.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ceaser-ad-business.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Component selector labels
*/}}
{{- define "ceaser-ad-business.componentSelectorLabels" -}}
app.kubernetes.io/name: {{ include "ceaser-ad-business.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "ceaser-ad-business.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "ceaser-ad-business.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create a default fully qualified redis name.
*/}}
{{- define "ceaser-ad-business.redis.fullname" -}}
{{- if .Values.redis.fullnameOverride -}}
{{- .Values.redis.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "redis" .Values.redis.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Create a default fully qualified qdrant name.
*/}}
{{- define "ceaser-ad-business.qdrant.fullname" -}}
{{- if .Values.qdrant.fullnameOverride -}}
{{- .Values.qdrant.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default "qdrant" .Values.qdrant.nameOverride -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/*
Get Redis URL
*/}}
{{- define "ceaser-ad-business.redis.url" -}}
{{- if .Values.redis.enabled -}}
{{- if .Values.redis.auth.enabled -}}
redis://:{{ .Values.redis.auth.password }}@{{ include "ceaser-ad-business.redis.fullname" . }}-master:6379
{{- else -}}
redis://{{ include "ceaser-ad-business.redis.fullname" . }}-master:6379
{{- end -}}
{{- else -}}
{{- .Values.externalRedis.url -}}
{{- end -}}
{{- end -}}

{{/*
Create image reference
*/}}
{{- define "ceaser-ad-business.image" -}}
{{- $registry := .global.imageRegistry | default .registry -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry .repository .tag -}}
{{- else -}}
{{- printf "%s:%s" .repository .tag -}}
{{- end -}}
{{- end -}}
