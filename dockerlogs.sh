#!/usr/bin/env bash
# Helper script used in the makefile for the development network

until docker logs -f dev-peer0.org1.example.com-mycc-${1}; do
  echo Chaincode container did not start yet, retrying in 5 seconds...
  sleep 5
done