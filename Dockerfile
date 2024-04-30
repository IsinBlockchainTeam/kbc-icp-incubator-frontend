FROM node:20 as builder

# ------------------------------------- build args -----------------------------------------------
ARG BLOCKCHAIN_LIB_REGISTRY_READ_TOKEN=blockchain_lib_registry_read_token
ARG BLOCKCHAIN_LIB_REGISTRY_DOMAIN=blockchain_lib_registry_domain
ARG COFFEE_TRADING_LIB_REGISTRY_READ_TOKEN=coffetrading_lib_registry_read_token
ARG COFFEE_TRADING_LIB_REGISTRY_DOMAIN=coffetrading_lib_registry_domain
ARG UNECE_COTTON_FETCH_REGISTRY_READ_TOKEN=unece_cotton_fetch_registry_read_token
ARG UNECE_COTTON_FETCH_REGISTRY_DOMAIN=unece_cotton_fetch_registry_domain

# -------------------- taken from gitlab build args file---------------------
ARG REACT_APP_UNECE_BACKEND_URL=unece_backend_url
ARG REACT_APP_VERIFIER_BACKEND_URL=verifier_backend_url
ARG REACT_APP_EMAIL_SENDER_URL=email_sender_url
ARG REACT_APP_RPC_URL=rpc_url

ARG REACT_APP_CONTRACT_PROCESS_TYPE=contract_process_type
ARG REACT_APP_CONTRACT_ASSESSMENT_STANDARD=contract_assessment_standard
ARG REACT_APP_CONTRACT_PRODUCT_CATEGORY=contract_product_category
ARG REACT_APP_CONTRACT_MATERIAL=contract_material
ARG REACT_APP_CONTRACT_DOCUMENT=contract_document
ARG REACT_APP_CONTRACT_ESCROW_MANAGER=contract_escrow_manager
ARG REACT_APP_CONTRACT_TRADE=contract_trade
ARG REACT_APP_CONTRACT_RELATIONSHIP=contract_relationship
ARG REACT_APP_CONTRACT_ASSET_OPERATION=contract_asset_operation
ARG REACT_APP_CONTRACT_OFFER=contract_offer
# ---------------------------------------------------------------------------------------------

WORKDIR /app
COPY config-overrides.js /app/
COPY package.json /app/
COPY tsconfig.json /app/
COPY public /app/public
COPY src /app/src

RUN npm config set @blockchain-lib:registry https://$BLOCKCHAIN_LIB_REGISTRY_DOMAIN
RUN npm config set -- "//$BLOCKCHAIN_LIB_REGISTRY_DOMAIN:_authToken" "$BLOCKCHAIN_LIB_REGISTRY_READ_TOKEN"

RUN npm config set @kbc-lib:registry https://$COFFEE_TRADING_LIB_REGISTRY_DOMAIN
RUN npm config set -- "//$COFFEE_TRADING_LIB_REGISTRY_DOMAIN:_authToken" "$COFFEE_TRADING_LIB_REGISTRY_READ_TOKEN"

RUN npm config set @unece:registry https://$UNECE_COTTON_FETCH_REGISTRY_DOMAIN
RUN npm config set -- "//$UNECE_COTTON_FETCH_REGISTRY_DOMAIN:_authToken" "$UNECE_COTTON_FETCH_REGISTRY_READ_TOKEN"

RUN npm i
RUN npm run build
#RUN npm run build http://[url]/api


FROM nginx:stable-alpine as runner

RUN apk add openssl

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -out /etc/nginx/certs/localhost.crt -keyout /etc/nginx/certs/localhost.key \
      -newkey rsa:2048 -nodes -sha256 \
      -subj '/CN=localhost' -extensions EXT -config <( \
       printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
