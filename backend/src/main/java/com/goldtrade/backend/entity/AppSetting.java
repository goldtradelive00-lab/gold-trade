package com.goldtrade.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "app_settings")
@Data
@NoArgsConstructor
public class AppSetting {

    @Id
    @Column(name = "key")
    private String key;

    @Column(name = "value", nullable = false)
    private String value;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public AppSetting(String key, String value) {
        this.key = key;
        this.value = value;
    }

    @PrePersist
    @PreUpdate
    protected void onSave() {
        updatedAt = OffsetDateTime.now();
    }
}
