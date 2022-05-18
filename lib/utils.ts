const addressRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;

export function shortenAddress(address: string) {
  const match = address.match(addressRegex);

  return match ? `${match[1]}…${match[2]}` : address;
};
