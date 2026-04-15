package com.example.scriboai.document.model;

import com.example.scriboai.folder.model.Folder;
import com.example.scriboai.user.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "documents",
        indexes = {
                @Index(name = "idx_docs_owner", columnList = "owner_id"),
                @Index(name = "idx_docs_folder", columnList = "folder_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"owner", "folder"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private String title = "Untitled Document";

    @Column(columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "owner_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_documents_owner")
    )
    @org.hibernate.annotations.OnDelete(
            action = org.hibernate.annotations.OnDeleteAction.CASCADE
    )
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "folder_id",
        foreignKey = @ForeignKey(name = "fk_documents_folder")
    )
    @org.hibernate.annotations.OnDelete(
        action = org.hibernate.annotations.OnDeleteAction.CASCADE
    )
    private Folder folder;


}
