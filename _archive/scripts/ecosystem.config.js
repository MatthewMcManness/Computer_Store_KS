module.exports = {
  apps: [{
    name: 'computerstoreks-api',
    cwd: '/home/matthew/Computer Store V2/Computer_Store_KS/api',
    script: 'gallery-api.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
