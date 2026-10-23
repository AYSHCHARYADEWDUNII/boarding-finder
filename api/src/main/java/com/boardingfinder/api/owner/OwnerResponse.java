package com.boardingfinder.api.owner;

public record OwnerResponse(Long id, String name, String email) {
    public static OwnerResponse from(OwnerAccount owner) {
        return new OwnerResponse(owner.getId(), owner.getName(), owner.getEmail());
    }
}
