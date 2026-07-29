
const PUNCTUATION_RE = /[.\-_\/\\(),:;'’]/g;
const WHITESPACE_RE = /\s+/g;


const TECH_SYNONYMS: Record<string, string> = {

  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  python: "python",
  py: "python",
  golang: "golang",
  go: "golang",
  csharp: "csharp",
  cplusplus: "cplusplus",
  cpp: "cplusplus",
  fsharp: "fsharp",
  ruby: "ruby",
  java: "java",
  kotlin: "kotlin",
  swift: "swift",
  rust: "rust",
  rs: "rust",
  scala: "scala",
  objectivec: "objectivec",
  dart: "dart",
  elixir: "elixir",
  erlang: "erlang",
  haskell: "haskell",
  perl: "perl",
  matlab: "matlab",
  php: "php",
  lua: "lua",
  groovy: "groovy",
  powershell: "powershell",
  ps1: "powershell",
  bash: "bash",
  shell: "bash",
  sh: "bash",

  // ---- .net family ----
  dotnet: "dotnet",
  net: "dotnet", // standalone ".net" strips down to "net" before lookup
  dotnetcore: "dotnetcore",
  aspnet: "aspnet",
  aspnetcore: "aspnetcore",
  vbnet: "vbnet",

  // ---- frontend frameworks/libs ----
  reactjs: "reactjs",
  react: "reactjs",
  nextjs: "nextjs",
  next: "nextjs",
  vuejs: "vuejs",
  vue: "vuejs",
  nuxtjs: "nuxtjs",
  nuxt: "nuxtjs",
  angular: "angular",
  angularjs: "angularjs",
  sveltejs: "sveltejs",
  svelte: "sveltejs",
  sveltekit: "sveltekit",
  emberjs: "emberjs",
  ember: "emberjs",
  jquery: "jquery",
  redux: "redux",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  sass: "sass",
  scss: "sass",
  less: "less",
  webpack: "webpack",
  vite: "vite",
  babel: "babel",

  // ---- backend frameworks ----
  nodejs: "nodejs",
  node: "nodejs",
  expressjs: "expressjs",
  express: "expressjs",
  nestjs: "nestjs",
  nest: "nestjs",
  django: "django",
  flask: "flask",
  fastapi: "fastapi",
  rubyonrails: "rubyonrails",
  rails: "rubyonrails",
  ror: "rubyonrails",
  spring: "spring",
  springboot: "springboot",
  laravel: "laravel",
  symfony: "symfony",
  gin: "gin",
  fiber: "fiber",
  echoframework: "echoframework",
  phoenix: "phoenix",

  // ---- mobile ----
  reactnative: "reactnative",
  flutter: "flutter",
  swiftui: "swiftui",
  xamarin: "xamarin",
  ionic: "ionic",

  // ---- data / ml / ai ----
  pytorch: "pytorch",
  tensorflow: "tensorflow",
  keras: "keras",
  scikitlearn: "scikitlearn",
  sklearn: "scikitlearn",
  pandas: "pandas",
  numpy: "numpy",
  opencv: "opencv",
  huggingface: "huggingface",
  langchain: "langchain",
  spark: "spark",
  hadoop: "hadoop",

  // ---- databases ----
  postgresql: "postgresql",
  postgres: "postgresql",
  pgsql: "postgresql",
  mysql: "mysql",
  mariadb: "mariadb",
  sqlserver: "sqlserver",
  mssql: "sqlserver",
  mongodb: "mongodb",
  redis: "redis",
  sqlite: "sqlite",
  oracledb: "oracledb",
  oracle: "oracledb",
  dynamodb: "dynamodb",
  cassandra: "cassandra",
  elasticsearch: "elasticsearch",
  neo4j: "neo4j",
  firebase: "firebase",
  firestore: "firestore",

  // ---- devops / cloud / infra ----
  docker: "docker",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  terraform: "terraform",
  ansible: "ansible",
  jenkins: "jenkins",
  githubactions: "githubactions",
  gitlabci: "gitlabci",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  googlecloud: "gcp",
  googlecloudplatform: "gcp",
  nginx: "nginx",
  apache: "apache",

  // ---- api / protocols ----
  graphql: "graphql",
  grpc: "grpc",
  rest: "rest",
  restapi: "rest",
  websocket: "websocket",
  websockets: "websocket",

  // ---- testing ----
  jest: "jest",
  vitest: "vitest",
  mocha: "mocha",
  pytest: "pytest",
  junit: "junit",
  nunit: "nunit",
  xunit: "xunit",
  phpunit: "phpunit",
  rspec: "rspec",
  gotest: "gotest",
  testcontainers: "testcontainers",
  selenium: "selenium",
  cypress: "cypress",
  playwright: "playwright",

  // ---- api testing / dev tools ----
  postman: "postman",
  insomnia: "insomnia",
  bruno: "bruno",
  hoppscotch: "hoppscotch",

  // ---- js/runtime ecosystem ----
  bun: "bun",
  deno: "deno",
  electron: "electron",
  tauri: "tauri",

  // ---- backend frameworks (additional) ----
  fastify: "fastify",
  hapi: "hapi",
  ktor: "ktor",
  micronaut: "micronaut",
  quarkus: "quarkus",
  helidon: "helidon",
  axum: "axum",
  actixweb: "actixweb",
  actix: "actixweb",
  rocket: "rocket",
  warp: "warp",
  chi: "chi",
  beego: "beego",

  // ---- meta-frameworks / static site generators ----
  gatsby: "gatsby",
  astro: "astro",
  remix: "remix",
  eleventy: "eleventy",
  "11ty": "eleventy",
  hugo: "hugo",
  jekyll: "jekyll",
  docusaurus: "docusaurus",
  qwik: "qwik",
  solidjs: "solidjs",
  solid: "solidjs",

  // ---- frontend state management ----
  zustand: "zustand",
  mobx: "mobx",
  recoil: "recoil",
  jotai: "jotai",
  pinia: "pinia",
  vuex: "vuex",
  xstate: "xstate",

  // ---- animation / graphics / charting ----
  framermotion: "framermotion",
  gsap: "gsap",
  threejs: "threejs",
  three: "threejs",
  d3js: "d3js",
  d3: "d3js",
  chartjs: "chartjs",
  highcharts: "highcharts",
  echarts: "echarts",

  // ---- templating ----
  handlebars: "handlebars",
  pug: "pug",
  ejs: "ejs",
  mustache: "mustache",
  jinja2: "jinja2",
  jinja: "jinja2",
  thymeleaf: "thymeleaf",

  // ---- orms / database layers ----
  prisma: "prisma",
  drizzleorm: "drizzleorm",
  drizzle: "drizzleorm",
  knex: "knex",
  objectionjs: "objectionjs",
  objection: "objectionjs",
  mikroorm: "mikroorm",
  entityframework: "entityframework",
  entityframeworkcore: "entityframeworkcore",
  efcore: "entityframeworkcore",
  hibernate: "hibernate",
  jpa: "jpa",
  jooq: "jooq",
  exposed: "exposed",
  diesel: "diesel",
  sqlx: "sqlx",
  bunorm: "bunorm",
  ecto: "ecto",

  // ---- databases (additional sql/nosql) ----
  cockroachdb: "cockroachdb",
  yugabytedb: "yugabytedb",
  tidb: "tidb",
  timescaledb: "timescaledb",
  couchbase: "couchbase",
  ravendb: "ravendb",
  scylladb: "scylladb",
  cosmosdb: "cosmosdb",
  azurecosmosdb: "cosmosdb",
  fauna: "fauna",
  faunadb: "fauna",

  // ---- search ----
  opensearch: "opensearch",
  meilisearch: "meilisearch",
  typesense: "typesense",
  solr: "solr",
  apachesolr: "solr",
  algolia: "algolia",

  // ---- messaging / event streaming ----
  kafka: "kafka",
  apachekafka: "kafka",
  rabbitmq: "rabbitmq",
  nats: "nats",
  pulsar: "pulsar",
  apachepulsar: "pulsar",
  activemq: "activemq",
  apacheactivemq: "activemq",
  zeromq: "zeromq",
  zmq: "zeromq",
  sqs: "sqs",
  amazonsqs: "sqs",
  sns: "sns",
  amazonsns: "sns",
  pubsub: "pubsub",
  googlepubsub: "pubsub",
  azureservicebus: "azureservicebus",
  redisstreams: "redisstreams",

  // ---- api / protocols (additional) ----
  trpc: "trpc",
  openapi: "openapi",
  swagger: "swagger",
  asyncapi: "asyncapi",
  soap: "soap",
  jsonrpc: "jsonrpc",
  grpcweb: "grpcweb",
  protobuf: "protobuf",
  protocolbuffers: "protobuf",
  thrift: "thrift",
  avro: "avro",
  http2: "http2",
  http3: "http3",
  quic: "quic",
  webrtc: "webrtc",
  mqtt: "mqtt",
  amqp: "amqp",

  // ---- authentication / identity ----
  authjs: "authjs",
  nextauth: "authjs",
  nextauthjs: "authjs",
  clerk: "clerk",
  auth0: "auth0",
  keycloak: "keycloak",
  okta: "okta",
  awscognito: "awscognito",
  cognito: "awscognito",
  betterauth: "betterauth",
  passportjs: "passportjs",
  passport: "passportjs",
  oauth2: "oauth2",
  oauth20: "oauth2", // "OAuth 2.0" -> dot removal merges digits into "20"
  openidconnect: "openidconnect",
  oidc: "openidconnect",
  jwt: "jwt",
  mtls: "mtls",
  tls: "tls",
  saml: "saml",
  ldap: "ldap",

  // ---- backend as a service ----
  supabase: "supabase",
  appwrite: "appwrite",
  pocketbase: "pocketbase",
  nhost: "nhost",
  parse: "parse",
  parseserver: "parse",
  amplify: "amplify",
  awsamplify: "amplify",

  // ---- object storage ----
  s3: "s3",
  amazons3: "s3",
  r2: "r2",
  cloudflarer2: "r2",
  minio: "minio",
  gcs: "gcs",
  googlecloudstorage: "gcs",
  azureblobstorage: "azureblobstorage",

  // ---- cache ----
  memcached: "memcached",
  varnish: "varnish",

  // ---- cloud providers ----
  cloudflare: "cloudflare",
  digitalocean: "digitalocean",
  flyio: "flyio",
  railway: "railway",
  render: "render",
  oraclecloud: "oraclecloud",
  linode: "linode",
  hetzner: "hetzner",

  // ---- serverless ----
  awslambda: "awslambda",
  lambda: "awslambda",
  cloudflareworkers: "cloudflareworkers",
  azurefunctions: "azurefunctions",
  googlecloudfunctions: "googlecloudfunctions",
  vercelfunctions: "vercelfunctions",
  netlifyfunctions: "netlifyfunctions",

  // ---- infrastructure ----
  helm: "helm",
  dockercompose: "dockercompose",
  nomad: "nomad",
  ecs: "ecs",
  eks: "eks",
  aks: "aks",
  gke: "gke",
  openshift: "openshift",
  istio: "istio",
  linkerd: "linkerd",
  envoy: "envoy",
  consul: "consul",
  kong: "kong",
  apigee: "apigee",
  tyk: "tyk",
  apigateway: "apigateway",
  awsapigateway: "apigateway",

  // ---- infrastructure as code ----
  pulumi: "pulumi",
  awscdk: "awscdk",
  cdk: "awscdk",
  cloudformation: "cloudformation",
  crossplane: "crossplane",

  // ---- ci/cd ----
  argocd: "argocd",
  fluxcd: "fluxcd",
  teamcity: "teamcity",
  bamboo: "bamboo",
  buildkite: "buildkite",
  circleci: "circleci",
  travisci: "travisci",

  // ---- monitoring / observability ----
  prometheus: "prometheus",
  grafana: "grafana",
  opentelemetry: "opentelemetry",
  otel: "opentelemetry",
  jaeger: "jaeger",
  zipkin: "zipkin",
  loki: "loki",
  tempo: "tempo",
  datadog: "datadog",
  newrelic: "newrelic",
  dynatrace: "dynatrace",
  sentry: "sentry",

  // ---- logging ----
  elkstack: "elkstack",
  elk: "elkstack",
  fluentd: "fluentd",
  fluentbit: "fluentbit",
  logstash: "logstash",
  vector: "vector",

  // ---- security ----
  vault: "vault",
  hashicorpvault: "vault",
  owasp: "owasp",
  letsencrypt: "letsencrypt",

  // ---- ai / llm ----
  openai: "openai",
  anthropic: "anthropic",
  gemini: "gemini",
  ollama: "ollama",
  langgraph: "langgraph",
  dspy: "dspy",
  llamaindex: "llamaindex",
  haystack: "haystack",
  crewai: "crewai",
  autogen: "autogen",
  vercelaisdk: "vercelaisdk",
  pinecone: "pinecone",
  weaviate: "weaviate",
  milvus: "milvus",
  qdrant: "qdrant",
  chroma: "chroma",
  faiss: "faiss",

  // ---- data engineering ----
  airflow: "airflow",
  apacheairflow: "airflow",
  dagster: "dagster",
  dbt: "dbt",
  flink: "flink",
  apacheflink: "flink",
  beam: "beam",
  apachebeam: "beam",
  snowflake: "snowflake",
  bigquery: "bigquery",
  googlebigquery: "bigquery",
  redshift: "redshift",
  amazonredshift: "redshift",
  databricks: "databricks",
  presto: "presto",
  trino: "trino",
  hive: "hive",
  temporal: "temporal",
  camunda: "camunda",
  argoworkflows: "argoworkflows",

  // ---- build tools / package managers ----
  esbuild: "esbuild",
  swc: "swc",
  rollup: "rollup",
  parcel: "parcel",
  turborepo: "turborepo",
  nx: "nx",
  npm: "npm",
  pnpm: "pnpm",
  yarn: "yarn",
  poetry: "poetry",
  cargo: "cargo",
  gradle: "gradle",
  maven: "maven",

  // ---- linting / static analysis ----
  eslint: "eslint",
  prettier: "prettier",
  sonarqube: "sonarqube",
  checkstyle: "checkstyle",
  pylint: "pylint",
  rubocop: "rubocop",

  // ---- css / ui ----
  materialui: "materialui",
  mui: "materialui",
  chakraui: "chakraui",
  antdesign: "antdesign",
  antd: "antdesign",
  mantine: "mantine",
  radixui: "radixui",
  styledcomponents: "styledcomponents",
  emotion: "emotion",

  // ---- mobile (additional) ----
  expo: "expo",
  jetpackcompose: "jetpackcompose",
  kotlinmultiplatform: "kotlinmultiplatform",
  kmp: "kotlinmultiplatform",

  // ---- payments ----
  stripe: "stripe",
  razorpay: "razorpay",
  paypal: "paypal",
  paddle: "paddle",
  adyen: "adyen",

  // ---- cms ----
  strapi: "strapi",
  sanity: "sanity",
  contentful: "contentful",
  payloadcms: "payloadcms",
  payload: "payloadcms",
  directus: "directus",

  // ---- realtime ----
  socketio: "socketio",
  pusher: "pusher",
  ably: "ably",
  livekit: "livekit",

  // ---- background jobs / task queues ----
  celery: "celery",
  sidekiq: "sidekiq",
  bullmq: "bullmq",
  resque: "resque",
  hangfire: "hangfire",

  // ---- feature flags ----
  launchdarkly: "launchdarkly",
  flagsmith: "flagsmith",
  unleash: "unleash",
  splitio: "splitio",

  // ---- product analytics / telemetry ----
  segment: "segment",
  mixpanel: "mixpanel",
  amplitude: "amplitude",
  posthog: "posthog",
  googleanalytics: "googleanalytics",

  // ---- email / notifications ----
  sendgrid: "sendgrid",
  mailgun: "mailgun",
  twilio: "twilio",
  postmark: "postmark",
  resend: "resend",

  // ---- web3 / blockchain ----
  solidity: "solidity",
  web3js: "web3js",
  ethersjs: "ethersjs",
  hardhat: "hardhat",
  truffle: "truffle",

  // ---- version control ----
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  svn: "svn",
  mercurial: "mercurial",
  perforce: "perforce",

  // ---- container registries ----
  dockerhub: "dockerhub",
  ecr: "ecr",
  gcr: "gcr",
  harbor: "harbor",
  quay: "quay",
};

export function normalizeTechnology(raw: string): string {
  if (!raw) return "";

  // 1-2: lowercase + trim
  let s = raw.toLowerCase().trim();

  // 3: collapse internal whitespace runs
  s = s.replace(WHITESPACE_RE, " ");

  // 4: glued-symbol substitution (must happen before/independent of
  //    punctuation stripping since '#' and '+' aren't in that set)
  s = s.split("#").join("sharp");
  s = s.split("++").join("plusplus");

  // 5: strip punctuation/separators: . - _ / \ ( ) , : ;
  s = s.replace(PUNCTUATION_RE, "");

  // 6: remove all remaining spaces
  s = s.replace(WHITESPACE_RE, "");

  // 7-8: exact whole-string synonym lookup, fallback to formatted key
  return TECH_SYNONYMS[s] ?? s;
}

// ---------------------------------------------------------------------
// Self-check against the spec's canonical synonym table. Run with e.g.
// `npx ts-node normalizeTechnology.ts`
// ---------------------------------------------------------------------
if (require.main === module) {
  const cases: [string, string][] = [
    ["postgres", "postgresql"],
    ["postgresql", "postgresql"],
    ["pgsql", "postgresql"],
    ["react.js", "reactjs"],
    ["react js", "reactjs"],
    ["react-js", "reactjs"],
    ["node.js", "nodejs"],
    ["node js", "nodejs"],
    ["next.js", "nextjs"],
    ["express.js", "expressjs"],
    ["c#", "csharp"],
    ["c sharp", "csharp"],
    ["c++", "cplusplus"],
    ["cpp", "cplusplus"],
    ["f#", "fsharp"],
    ["asp.net", "aspnet"],
    ["vb.net", "vbnet"],
    [".net", "dotnet"],
    ["javascript", "javascript"],
    ["js", "javascript"],
    ["typescript", "typescript"],
    ["ts", "typescript"],
    ["mongodb", "mongodb"],
    ["mongo db", "mongodb"],
    ["ms sql", "sqlserver"],
    ["mssql", "sqlserver"],
    ["sql server", "sqlserver"],
    ["  Golang  ", "golang"],
    ["Ruby on Rails", "rubyonrails"],
    ["Django", "django"],
    ["FastAPI", "fastapi"],
    ["PyTorch", "pytorch"],
    ["Vue.js", "vuejs"],

    // ---- newly added families ----
    ["Bun", "bun"],
    ["Deno", "deno"],
    ["Fastify", "fastify"],
    ["Actix Web", "actixweb"],
    ["Drizzle ORM", "drizzleorm"],
    ["drizzle", "drizzleorm"],
    ["Entity Framework Core", "entityframeworkcore"],
    ["EF Core", "entityframeworkcore"],
    ["Apache Kafka", "kafka"],
    ["kafka", "kafka"],
    ["RabbitMQ", "rabbitmq"],
    ["Google Pub/Sub", "pubsub"], // slash is stripped by the punctuation set
    ["JSON-RPC", "jsonrpc"],
    ["Auth.js", "authjs"],
    ["NextAuth", "authjs"],
    ["AWS Cognito", "awscognito"],
    ["OAuth 2.0", "oauth2"], // dot-removal merges "2.0" -> "20" -> mapped explicitly
    ["Let's Encrypt", "letsencrypt"], // apostrophe handling
    ["Amazon S3", "s3"],
    ["Cloudflare R2", "r2"],
    ["ArgoCD", "argocd"],
    ["Flux CD", "fluxcd"],
    ["OpenTelemetry", "opentelemetry"],
    ["ELK Stack", "elkstack"],
    ["LangGraph", "langgraph"],
    ["Apache Airflow", "airflow"],
    ["dbt", "dbt"],
    ["BigQuery", "bigquery"],
    ["Material UI", "materialui"],
    ["MUI", "materialui"],
    ["Ant Design", "antdesign"],
    ["Socket.IO", "socketio"],
    ["Sidekiq", "sidekiq"],
    ["LaunchDarkly", "launchdarkly"],
    ["PostHog", "posthog"],
    ["Ethers.js", "ethersjs"],
    ["Pinecone", "pinecone"],
    ["CockroachDB", "cockroachdb"],
    ["Payload CMS", "payloadcms"],
  ];

  let failed = 0;
  for (const [input, expected] of cases) {
    const actual = normalizeTechnology(input);
    const ok = actual === expected;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${JSON.stringify(input).padEnd(20)} -> ${actual}${ok ? "" : `  (expected ${expected})`}`);
  }
  console.log(`\n${cases.length - failed}/${cases.length} passed`);
}