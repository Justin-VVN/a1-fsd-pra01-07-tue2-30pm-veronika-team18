'use client';

import { Box, Text, Flex, Link } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box as="footer" bg="gray.800" color="gray.300" py={8} mt="auto">
      <Flex maxW="80vw" mx="auto" px={8} justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text fontSize="sm">
          &copy; 2026 Venue Vendors (VV). All rights reserved.
        </Text>
        
        <Flex gap={6} fontSize="sm">
          <Link href="/about" _hover={{ color: 'white' }}>About</Link>
          <Link href="/contact" _hover={{ color: 'white' }}>Contact</Link>
          <Link href="/terms" _hover={{ color: 'white' }}>Terms</Link>
          <Link href="/privacy" _hover={{ color: 'white' }}>Privacy</Link>
        </Flex>

        <Text fontSize="sm" textAlign="right">
          Melbourne, Australia
        </Text>
      </Flex>
    </Box>
  );
}