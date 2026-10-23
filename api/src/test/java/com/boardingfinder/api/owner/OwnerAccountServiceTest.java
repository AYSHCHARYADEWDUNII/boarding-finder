package com.boardingfinder.api.owner;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OwnerAccountServiceTest {

    @Test
    void registerNormalizesEmailAndStoresOnlyAnEncodedPassword() {
        OwnerAccountRepository repository = mock(OwnerAccountRepository.class);
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        when(repository.existsByEmailIgnoreCase("owner@example.com")).thenReturn(false);
        when(repository.save(any(OwnerAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OwnerAccountService service = new OwnerAccountService(repository, passwordEncoder);
        OwnerAccount owner = service.register("  Room Owner  ", " Owner@Example.com ", "correct-horse");

        assertEquals("Room Owner", owner.getName());
        assertEquals("owner@example.com", owner.getEmail());
        assertTrue(passwordEncoder.matches("correct-horse", owner.getPassword()));
    }
}
