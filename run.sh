mkdir -p /html/static/js/
touch /html/static/js/env.js

echo "window.environment = {}" >> /html/static/js/env.js

# iterating over all environment variables
env -0 | while IFS='=' read -r -d '' n v; do

  # only environment variables that start with "APP_"
  if [[ $n == APP_* ]]
  then
    # add all env variables in js file
    echo "window.environment.$n = \"$v\"" >> /html/static/js/env.js; 
  fi
done

# When we run on knative, it mounts a /var/log dir and therefore wipes out the nginx dir. 
# Thats why we have to create this after the container starts up and the mount is done.
mkdir -p /var/log/nginx

nginx

tail -f /dev/null
