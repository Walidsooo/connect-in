#!/bin/bash

# Script de test complet pour Connect'In API
# Auteur: QA Expert AI
# Date: 23 février 2026

echo "============================================"
echo "🧪 TEST CONNECT'IN API - AUTHENTIFICATION & CRUD POSTS"
echo "============================================"
echo ""

BASE_URL="http://127.0.0.1:8000/api"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =========================================
# 1. TEST REGISTER (Inscription)
# =========================================
echo -e "${YELLOW}📝 TEST 1: Inscription d'un utilisateur${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@entreprise-esn.com",
    "password": "password123",
    "password_confirmation": "password123"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Extraction du token
TOKEN1=$(echo "$REGISTER_RESPONSE" | jq -r '.access_token // .token // empty')

if [ -n "$TOKEN1" ]; then
    echo -e "${GREEN}✅ Inscription réussie - Token généré${NC}"
else
    echo -e "${RED}❌ Échec de l'inscription${NC}"
fi
echo ""

# =========================================
# 2. TEST LOGIN (Connexion)
# =========================================
echo -e "${YELLOW}🔐 TEST 2: Connexion avec les identifiants${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "jean.dupont@entreprise-esn.com",
    "password": "password123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'

TOKEN2=$(echo "$LOGIN_RESPONSE" | jq -r '.token // .access_token // empty')

if [ -n "$TOKEN2" ]; then
    echo -e "${GREEN}✅ Connexion réussie - Token récupéré${NC}"
    TOKEN="$TOKEN2"
else
    echo -e "${RED}❌ Échec de la connexion${NC}"
    TOKEN="$TOKEN1"
fi
echo ""

# =========================================
# 3. TEST PROFILE (Profil utilisateur)
# =========================================
echo -e "${YELLOW}👤 TEST 3: Récupération du profil utilisateur${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

echo "$PROFILE_RESPONSE" | jq '.'

if echo "$PROFILE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Profil récupéré avec succès${NC}"
    USER_ID=$(echo "$PROFILE_RESPONSE" | jq -r '.id')
else
    echo -e "${RED}❌ Échec de récupération du profil${NC}"
fi
echo ""

# =========================================
# 4. TEST CREATE POST (sans image)
# =========================================
echo -e "${YELLOW}📝 TEST 4: Création d'un post SANS image${NC}"
POST1_RESPONSE=$(curl -s -X POST "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "content": "Ceci est mon premier post de test depuis le script QA ! 🚀"
  }')

echo "$POST1_RESPONSE" | jq '.'

POST1_ID=$(echo "$POST1_RESPONSE" | jq -r '.post.id // empty')

if [ -n "$POST1_ID" ]; then
    echo -e "${GREEN}✅ Post créé avec succès (ID: $POST1_ID)${NC}"
else
    echo -e "${RED}❌ Échec de création du post${NC}"
fi
echo ""

# =========================================
# 5. TEST GET ALL POSTS
# =========================================
echo -e "${YELLOW}📋 TEST 5: Récupération de tous les posts${NC}"
ALL_POSTS=$(curl -s -X GET "$BASE_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

echo "$ALL_POSTS" | jq '.'

POST_COUNT=$(echo "$ALL_POSTS" | jq '. | length')
echo -e "${GREEN}✅ Nombre de posts récupérés: $POST_COUNT${NC}"
echo ""

# =========================================
# 6. TEST UPDATE POST (Mise à jour)
# =========================================
if [ -n "$POST1_ID" ]; then
    echo -e "${YELLOW}✏️ TEST 6: Mise à jour du post (ID: $POST1_ID)${NC}"
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/posts/$POST1_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d '{
        "content": "Post modifié avec succès ! ✅"
      }')
    
    echo "$UPDATE_RESPONSE" | jq '.'
    
    if echo "$UPDATE_RESPONSE" | jq -e '.post' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Post mis à jour avec succès${NC}"
    else
        echo -e "${RED}❌ Échec de mise à jour${NC}"
    fi
    echo ""
fi

# =========================================
# 7. TEST CRÉATION 2ÈME UTILISATEUR
# =========================================
echo -e "${YELLOW}👥 TEST 7: Création d'un 2ème utilisateur (Test Permission)${NC}"
USER2_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Sophie",
    "email": "sophie.martin@entreprise-esn.com",
    "password": "password123",
    "password_confirmation": "password123"
  }')

TOKEN_USER2=$(echo "$USER2_RESPONSE" | jq -r '.access_token // .token // empty')

if [ -n "$TOKEN_USER2" ]; then
    echo -e "${GREEN}✅ 2ème utilisateur créé${NC}"
else
    echo -e "${RED}❌ Échec création 2ème utilisateur${NC}"
fi
echo ""

# =========================================
# 8. TEST PERMISSIONS - Tentative de modification par un autre utilisateur
# =========================================
if [ -n "$POST1_ID" ] && [ -n "$TOKEN_USER2" ]; then
    echo -e "${YELLOW}🚫 TEST 8: Tentative de modification du post par User2 (DOIT ÉCHOUER)${NC}"
    FORBIDDEN_RESPONSE=$(curl -s -X PUT "$BASE_URL/posts/$POST1_ID" \
      -H "Authorization: Bearer $TOKEN_USER2" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -w "\nHTTP_CODE:%{http_code}" \
      -d '{
        "content": "Tentative de hack !"
      }')
    
    HTTP_CODE=$(echo "$FORBIDDEN_RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)
    BODY=$(echo "$FORBIDDEN_RESPONSE" | sed '/HTTP_CODE/d')
    
    echo "$BODY" | jq '.'
    
    if [ "$HTTP_CODE" == "403" ]; then
        echo -e "${GREEN}✅ SÉCURITÉ OK - 403 Forbidden renvoyé${NC}"
    else
        echo -e "${RED}❌ PROBLÈME DE SÉCURITÉ - Code HTTP: $HTTP_CODE (attendu: 403)${NC}"
    fi
    echo ""
fi

# =========================================
# 9. TEST DELETE PAR AUTRE UTILISATEUR
# =========================================
if [ -n "$POST1_ID" ] && [ -n "$TOKEN_USER2" ]; then
    echo -e "${YELLOW}🚫 TEST 9: Tentative de suppression du post par User2 (DOIT ÉCHOUER)${NC}"
    DELETE_FORBIDDEN=$(curl -s -X DELETE "$BASE_URL/posts/$POST1_ID" \
      -H "Authorization: Bearer $TOKEN_USER2" \
      -H "Accept: application/json" \
      -w "\nHTTP_CODE:%{http_code}")
    
    HTTP_CODE=$(echo "$DELETE_FORBIDDEN" | grep "HTTP_CODE" | cut -d':' -f2)
    BODY=$(echo "$DELETE_FORBIDDEN" | sed '/HTTP_CODE/d')
    
    echo "$BODY" | jq '.'
    
    if [ "$HTTP_CODE" == "403" ]; then
        echo -e "${GREEN}✅ SÉCURITÉ OK - 403 Forbidden renvoyé${NC}"
    else
        echo -e "${RED}❌ PROBLÈME DE SÉCURITÉ - Code HTTP: $HTTP_CODE (attendu: 403)${NC}"
    fi
    echo ""
fi

# =========================================
# 10. TEST DELETE PAR LE BON UTILISATEUR
# =========================================
if [ -n "$POST1_ID" ]; then
    echo -e "${YELLOW}🗑️ TEST 10: Suppression du post par son auteur (User1)${NC}"
    DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/posts/$POST1_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Accept: application/json")
    
    echo "$DELETE_RESPONSE" | jq '.'
    
    if echo "$DELETE_RESPONSE" | jq -e '.message' | grep -q "supprimé"; then
        echo -e "${GREEN}✅ Post supprimé avec succès${NC}"
    else
        echo -e "${RED}❌ Échec de suppression${NC}"
    fi
    echo ""
fi

# =========================================
# RÉSUMÉ FINAL
# =========================================
echo ""
echo "============================================"
echo -e "${GREEN}🎉 TESTS TERMINÉS${NC}"
echo "============================================"
echo ""
echo "📌 URLs pour tests manuels :"
echo "   - API Base: $BASE_URL"
echo "   - Register: $BASE_URL/register"
echo "   - Login: $BASE_URL/login"
echo "   - Posts: $BASE_URL/posts"
echo ""
echo "🔑 Token User1: $TOKEN"
echo "🔑 Token User2: $TOKEN_USER2"
echo ""
